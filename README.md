# Audio-Lernplattform-Client
Der Audio-Lernplattform-Client ist eine Cordova-Anwendung mit React, welche eine digitale Musikplattform bereitstellt. Sie wird für Android, iOS und (mit begrenzter Funktionalität) dem Browser entwickelt. Der Audio-Lernplattform-Client bietet u.A. an:
 * Musikstücke abzuspielen und zu manipulieren
 * eigene Aufnahmen durchzuführen
 * Nutzer mit verschiedenen Rollen wie Schüler und Lehrer
 * Rollenbasierte Funktionalität, z.B. Möglichkeit für Lehrer einen Stundenplan zu erstellen
 * Verknüpfung zwischen Usern durch QR-Code
 * Beliebige Aufgaben in einem Kanban-Board zu verwalten & zu verteilen
 * Bibliothek mit beliebigen vordefinierten Musikstücken suchen, filtern und die Elemente abzuspielen
 ...

Dieses Projekt umfasst alle notwendigen Bestandteile um...
* Den Client zu starten & bereitzustellen

## Über die Audio-Lernplattform
Die Digitale Musikplattform ist eine musikpädagogische Cordova-App, welche mehrere Features umfasst:
* Nutzerverwaltung: Schüler, Lehrer & Eltern: Alle in einer Anwendung mit unterschiedlichen Features, ...
* Verbindungen aufbauen: Nutzer können sich verknüpfen, ...
* Chatting: Verknüpfte User können miteinander Chatten
* Aufgabenverwaltung: Mithilfe eines Kanban-Boards können Aufgaben organisiert werden
* Dateiverwaltung
* Bibliothek
* Interaktiver Audio-Player: Musikstücke können abgespielt, die Lautstärke einzelner Spuren, der Pitch und die Wiedergabegeschwindigkeit verändert werden; Ausschnitte aus dem Track können ausgewählt werden; Optional mit Video
* Korrepititionsmöglichkeit: Innerhalb des Audio-Players kann parallel Musik aufgenommen und abgespielt werden
* Browser-Funktionalität: Ein Teil der Features ist ebenfalls im Browser verfügbar
...

Dieses Projekt ist Teil einer gesamten Plattform.
Folgende weitere Projekte gehören dazu:
* Audio-Lernplattform-Server
* Audio-Lernplattform-UI-Komponentenbiliothek
* Audio-Lernplattform-Bibliothek
* Audio-Lernplattform-Chatting
...

## Technologien / Features
Folgende Technologien werden verwendet: 
* Node (v12.16.1)
* React (v16.13)
* Cordova (global, v9): Android, iOS, Browser-Plattform sind getestet
* Kommunikation mit einer GraphQL-Schnittstelle (Audio-Lernplattform-Server) durch [Apollo Client](https://github.com/apollographql/apollo-client)
* Geschützte Ressourcen durch Keycloak & keycloak-connect-graphql
* Integration mit Webpack + Live Reload Server durch [Cordova Plugin Webpack](https://www.npmjs.com/package/cordova-plugin-webpack)
* Kanban-Board mit React-Trello
* QR-Scanner mit cordova-plugin-qr
* Audio-Player durch audio-platform-common-components
* Eigene UI durch audio-platform-ui-components
* Chat via Matrix

## Voraussetzungen
* Node.js vorinstalliert (v12.16.1)

## Setup
* Cordova global installieren: `npm i -g cordova@9`
* Packages installieren: `npm i`
* Server aufsetzen: Link zu Server-projekt
* `.env` aus `.env.base` erstellen, ggf. Ports + Pfad anpassen
* `keycloak.json` anpassen
* Cordova Plattformen vorbereiten: `cordova prepare`

Der Client ist nun bereit.

* Start der Browser-Plattform durch `npm run start`
* Start der Browser-Plattform mit Live-Reload durch `npm run start-reload`
* Start der Android-Plattform durch `npm run android:start`
* Start der Android-Plattform mit Live-Reload durch `npm run android:start-reload`
  * ggf. muss beim Cordova...-Plugin die LiveReload-URL ausgetauscht werden,
* Start der iOS-Plattform durch `npm run ios:start`
* Start der iOS-Plattform mit Live-Reload durch `npm run ios:start-reload`

