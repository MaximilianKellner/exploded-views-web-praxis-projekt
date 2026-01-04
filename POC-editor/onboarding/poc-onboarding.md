## POC: Onboarding & Datei-Import

### Problem:
   * Nutzer benötigen eine intuitive Möglichkeit, 3D-Modelle und Konfigurationen zu laden, um den Editor zu starten.
   * Die Anwendung muss Dateieingaben verarbeiten, bevor die 3D-Szene initialisiert wird.
   * Das Exploded-View-Paket muss in den Editor integriert werden.

### Scope:
   * Implementierung eines Onboarding-Overlays.
   * Datei-Upload-Funktionalität für .glb (Modell) und .json (Konfiguration).
   * Visuelles Feedback bei der Dateiauswahl.
   * Übergang vom Onboarding zur Hauptansicht des Editors.

### Resources:
   * HTML/CSS für das Onboarding-UI.
   * Exploded-View NPM-Paket. 

### Description:
   * Die Anwendung startet mit einem Onboarding-Screen, der über dem 3D-Canvas liegt.
   * Nutzer erhalten Optionen zum Hochladen eines Modells und einer optionalen Konfiguration.
   * Nach erfolgreichem Upload wird der Editor initialisiert.

### Success Criteria:
   * Onboarding-Screen ist beim Laden sichtbar.
   * Nutzer können .glb- und .json-Dateien auswählen.
   * UI aktualisiert sich entsprechend der ausgewählten Dateien.
   * Editor startet korrekt mit den geladenen Dateien.

### Fail Criteria:
   * Exploded-View-Paket funktioniert nicht im Editor.
   * Onboarding-Screen erscheint nicht.
   * Dateien können nicht ausgewählt werden.
   * Editor startet ohne Modell.

### Fallbacks:
   * Alternative Integtation des Exploded-View-Pakets finden.
   * Grundlegende Animationsfunktionen ohne das Paket implementieren.