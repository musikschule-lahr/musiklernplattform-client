/* eslint-disable no-empty-pattern */
import { formatDate } from '~/constants/util';

export const typePolicies = {
  Query: {
    fields: {
      getFormattedTimetable: {
        merge: false,
      },
      getTimetable: {
        merge: false,
      },

      getPlans: {
        merge: false,
        plans: (existing) => {
          if (existing) return existing;
          return [];
        },
      },
      getGroupsOfOwner: {
        merge: false,
      },

      getFavorites: {
        merge: false,
        read: (existing) => {
          if (existing) return existing;
          return [];
        },
      },
      getKorrepetitionGroupedInstrument: {
        merge: false,
        read: (existing) => {
          if (existing) return existing;
          return [];
        },
      },

      // Relations
      getMyChildren: {
        merge: false,
      },
      getMyTeachers: {
        merge: false,
      },
      getMyParents: {
        merge: false,
      },
      getSortedContactList: {
        merge: false,
      },
      getMyUnconfirmedStudents: {
        merge: false,
      },
      getConfirmedWithRelatedStudent: {
        keyArgs: ['where', ['id']],
        merge: false,
      },
      getMyConfirmedRelationsWithUser: {
        keyArgs: ['user', ['id']],
        merge: false,
      },
      getMyConfirmedStudents: {
        merge: false,
      },
      getStudentTeachers: {
        keyArgs: ['where', ['id']],
        merge: false,
      },
      getStudentParents: {
        keyArgs: ['where', ['id']],
        merge: false,
      },
      filterLibElems: {
        merge: false,
      },

    },
  },
  User: {
    keyFields: ['idUser'],
    fields: {
      id: (existing, { readField }) => `${readField('idUser')}`,
      fullname: (existing, { readField }) => `${readField('firstname')} ${readField('lastname')}`,
      teachedInstruments: {
        merge: false,
      },
      instruments: {
        merge: false,
      },
      relatedTo: {
        merge: (existing, incoming, { mergeObjects, readField }) => incoming,
      },
      relatedBy: {
        merge: (existing, incoming, { mergeObjects, readField }) => incoming,
      },
    },
  },
  Instrument: {
    keyFields: ['idInstrument'],
    fields: {
      id: (existing, { readField }) => `${readField('idInstrument')}`,
      selected: () => false,
    },
  },
  UserBoard: {
    keyFields: ['idBoard'],
    fields: {
      id: (existing, { readField }) => `${readField('idBoard')}`,
    },
  },
  GroupBoard: {
    keyFields: ['idBoard'],
    fields: {
      id: (existing, { readField }) => `${readField('idBoard')}`,
    },
  },
  Lane: {
    keyFields: ['idLane'],
    fields: {
      id: (existing, { readField }) => existing || `${readField('idLane')}`,
      laneId: (existing, { readField }) => existing || `${readField('idLane')}`,
      cards: {
        merge: false,
      },
      disallowAddingCard: (existing, { readField }) => readField('title').toUpperCase() === 'ERLEDIGT',
      light: (existing, { readField }) => readField('laneType').toUpperCase() === 'OTHER',
      addModalText: (existing, { readField }) => {
        switch (readField('laneType').toUpperCase()) {
          case 'OTHER': return 'Meine Sammlung erstellen';
          case 'DONE': return 'Erledigt hinzufügen';
          default: return 'TO DO hinzufügen';
        }
      },
      editModalText: (existing, { readField }) => {
        switch (readField('laneType').toUpperCase()) {
          case 'OTHER': return 'Meine Sammlung bearbeiten';
          case 'DONE': return 'Erledigt bearbeiten';
          default: return 'TO DO bearbeiten';
        }
      },
    },
  },
  Card: {
    fields: {
      keyFields: ['idCard'],
      id: (existing, { readField }) => existing || `${readField('idCard')}`,
      cardId: (existing, { readField }) => existing || `${readField('idCard')}`,
      laneId: (existing) => existing || null,
      date: (existing, { readField }) => {
        const date = readField('createdAt');
        return formatDate(date);
      },
      author: (existing, { readField }) => {
        const creatorRef = readField('creator');
        return `${readField('firstname', creatorRef)} ${
          readField('lastname', creatorRef)}`;
      },
      attachementCount: (existing, { readField }) => {
        const libElements = readField('libElements');
        return libElements.length;
      },
    },
  },
  Timetable: {
    keyFields: ['idTimetable'],
    fields: {
      id: (existing, { readField }) => `${readField('idTimetable')}`,
    },
  },
  Day: {
    keyFields: ['idDay'],
    fields: {
      id: (existing, { readField }) => `${readField('idDay')}`,
      timeslots: {
        merge: false,
      },
    },

  },
  Timeslot: {
    keyFields: ['idTimeslot'],
    fields: {
      id: (existing, { readField }) => `${readField('idTimeslot')}`,
    },
  },
  Group: {
    keyFields: ['idGroup'],
    fields: {
      id: (existing, { readField }) => readField('idGroup'),
      type: () => 'group',
      relations: {
        merge: false,
      },
    },
  },
  UserRelation: {
    keyFields: ['idCompound'],
    fields: {
      id: (existing, { readField }) => readField('idRelation'),
      type: () => 'user',
      name: (existing, { readField }) => {
        const related = readField('relatedUser');
        if (!related) return null;
        return `${readField('firstname', related)} ${
          readField('lastname', related)}`;
      },
      confirmedInstruments: {
        merge: false,
      },
      instruments: {
        merge: false,
      },
      groups: {
        merge: false,
      },
      confirmedGroups: {
        merge: false,
      },
    },
  },
  LibElement: {
    keyFields: ['idLibElement'],
    fields: {
      isFavorite: (existing) => (existing || false),
    },
  },
  MetaData: {
    keyFields: ['idMetaData'],
  },
  Composer: {
    keyFields: ['idComposer'],
    fields: {
      firstname: (existing) => (existing || ''),
      lastname: (existing) => (existing || ''),
    },
  },
  Interpreter: {
    keyFields: ['idInterpreter'],
    fields: {
      name: (existing) => (existing || ''),
    },
  },
  Epoch: {
    keyFields: ['idEpoch'],
    fields: {
      selected: () => false,
    },
  },
};

export default typePolicies;
