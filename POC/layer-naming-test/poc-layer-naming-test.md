## Zugriff auf einzelne Komponenten und Manipulation nach Namenskonvention

### Problem:
   * Untersuchung, wie auf einzelne Komponenten innerhalb einer 3D-Datei (z.B. GLB-Format aus Blender) basierend auf einer definierten Namenskonvention zugegriffen und diese für Animationen erstellt werden können.

### Scope:
   * Laden eines 3D-Modells (`.glb`-Datei), dessen interne Objekte einer spezifischen Namenskonvention folgen
   * Iterieren durch die geladene Three.js-Szene, um Objekte anhand ihrer Namen zu identifizieren.
   * Implementierung einer Logik, um Objekte basierend auf Namensbestandteilen (Präfixe wie `base_`, `exp_Layer<Nummer>_`) zu filtern und zu gruppieren.
   * Testweise Manipulation (z.B. Translation, Rotation, Skalierung, Materialänderung) von ausgewählten Objektgruppen basierend auf ihrer Benennung.


### Resources:
   * Three.js
   * Blender
   * Ein 3D-Modell mit einer internen Struktur, die der definierten Namenskonvention folgt.

### Description:
   * Dieser POC soll prüfen, ob es möglich ist einzelne Komponenten einer 3D datei gezielt zu manipulieren. Dabei soll der Nutzer die Konfiguration in Blender durchführen und die  Animation wird durch Code generiert.

### Success Criteria:
   * Das 3D-Modell wird erfolgreich geladen und dargestellt.
   * Das Modell wird animiert.
   * Die Animation wird aus Basis der Komponentennamen erstellt.
   * Die ausgewählten Objektgruppen können sichtbar unterschiedlich manipuliert werden (z.B. `L1`-Teile verschieben sich um X Einheiten in Y-Richtung, `L2`-Teile um Y Einheiten in Y-Richtung).

### Fail Criteria:
   * Objekte können nicht anhand der Namenskonvention identifiziert werden.
   * Es kann keine Animation generiert werden.

### Fallbacks:
   * Falls das Generieren von Animationen auf basis der Objektnamen nicht möglich ist müssen die User die Animation selber erstellen. Dadurch wird der 3d Ansatz weniger relevant.