import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ApolloProvider, ApolloClient, InMemoryCache, HttpLink, from, split,
} from '@apollo/client';
import { CachePersistor } from 'apollo-cache-persist';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { useKeycloak } from '@react-keycloak/web';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
import { typePolicies } from './typePolicies';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const ApolloProviderWrapper = ({ children }) => {
  const { keycloak } = useKeycloak();

  const [client, _setClient] = useState(null);
  const [initializeApollo, setInitializeApollo] = useState(false);
  const [loading, setLoading] = useState(true);

  const clientRef = useRef(null);
  const cachePersistor = useRef(null);

  const setClient = (data) => {
    clientRef.current = data;
    _setClient(data);
  };
  useEffect(() => {
    if (!keycloak.authenticated) {
      localStorage.removeItem('apollo-cache-persist');
      if (cachePersistor.current) cachePersistor.current.purge();
      cachePersistor.current = null;
      setInitializeApollo(true);
    } else setInitializeApollo(true);
  }, [keycloak.authenticated]);
  useEffect(() => {
    if (initializeApollo) {
      setLoading(true);
      setInitializeApollo(false);
      const withToken = setContext((request, previousContext) => ({
        ...previousContext,
        headers: {
          authorization: `Bearer ${keycloak.token}`,
        },
      }));

      const errorLink = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
        // https://able.bio/AnasT/apollo-graphql-async-access-token-refresh--470t1c8
          graphQLErrors.map((err) => {
            console.log(err);
            // Requires keycloak-connect-graphql 0.4.0 on server
            switch (err.extensions.exception.code) {
              case 'UNAUTHENTICATED': {
                keycloak.updateToken(5)
                  .then((refreshed) => {
                    if (refreshed) {
                      console.log('Token was successfully refreshed');
                    } else {
                      console.log('Token is still valid');
                    }
                    localStorage.setItem('accesstoken', keycloak.token);
                    localStorage.setItem('refreshtoken', keycloak.refreshToken);
                  }).catch(() => {
                    console.log('Failed to refresh the token, or the session has expired', keycloak);
                    localStorage.removeItem('accesstoken', keycloak.token);
                    localStorage.removeItem('refreshtoken', keycloak.refreshToken);
                  });
                break;
              }
              default: { // no break before on purpose for now, since we only want skeleton
              // return forward(operation);
              }
            }
          });
        }
        if (networkError) {
          console.log(`[Network error]: ${networkError}`);
        }
        return null;
      });

      const httpLink = new HttpLink({
        uri: process.env.GRAPHQL_SERVER_URL,
      });

      const wsLink = new WebSocketLink({
        uri: process.env.GRAPHQL_SUBSCRIPTION_URL,
        options: {
          reconnect: true,
          connectionParams: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        },
      });

      const splitLink = split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition'
          && definition.operation === 'subscription'
          );
        },
        wsLink,
        httpLink,
      );

      const link = from([
        withToken,
        errorLink,
        splitLink,
      ]);
      const cache = new InMemoryCache(
        {
          typePolicies,
        },
      );
      const persistor = new CachePersistor({
        cache,
        storage: window.localStorage,
      });
      cachePersistor.current = persistor;
      /* persistor.restore().then( () => */ persistor.persist()
      /* ) */.then(
          () => {
            setClient(new ApolloClient({
              uri: process.env.GRAPHQL_SERVER_URL,
              cache,
              link,
            }));
            setLoading(false);
          },
        )
        .catch((err) => console.log(err));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [initializeApollo, keycloak]);

  if (!client || loading) return <LoadingIndicator padding />;
  return (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );
};

ApolloProviderWrapper.propTypes = {
  children: PropTypes.node,
};

ApolloProviderWrapper.defaultProps = {
  children: <div />,
};

export default ApolloProviderWrapper;
