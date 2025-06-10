## POC: Textlabel-Integration

### Problem:
   * Untersuchung, wie Textlabel dynamisch zu spezifischen 3D-Objekten hinzugefügt und positioniert werden können, sodass sie mit den Objekten verbunden bleiben und sich synchron bewegen. Die Label-Informationen sollen extern (JSON/YAML) definiert und über eine Namenskonvention den Objekten zugeordnet werden.

### Scope:
   * Laden eines 3D-Modells (`.glb`-Datei).
   * Laden von Label-Definitionen aus einer externen Datei (JSON oder YAML).
   * Identifizieren von 3D-Objekten in der Szene anhand der Namenskonvention `exp-L<Ebenennummer>-dir<Richtungscode>-<OptionalerName>`.
   * Zuordnen der Label-Texte zu den entsprechenden 3D-Objekten basierend auf dem `<OptionalerName>` oder der gesamten Namensstruktur.
   * Implementierung der Logik zur Anzeige von 2D-Textlabels im 3D-Raum, die an den jeweiligen Objekten "hängen".
   * Sicherstellen, dass sich die Label korrekt mit den Objekten bewegen.
   * Testen der Aktualisierung von Label-Positionen bei Objektanimationen.

### Resources:
   * Three.js
   * HTML/CSS für die Label-Darstellung (z.B. `CSS2DRenderer` oder `CSS3DRenderer` von Three.js)
   * Ein 3D-Modell mit Objekten, die der definierten Namenskonvention folgen.
   * Eine JSON- oder YAML-Datei mit Label-Definitionen.

### Description:
   * Dieser POC soll validieren, ob es möglich ist, Textlabel effektiv mit einzelnen Komponenten eines 3D-Modells zu verknüpfen. Die Label sollen Informationen zu den Bauteilen anzeigen und sich bei Animationen oder Kameraänderungen korrekt mitbewegen. Die Konfiguration der Label erfolgt extern, um eine einfache Anpassung und Wartung zu ermöglichen.

### Success Criteria:
   * Das 3D-Modell wird erfolgreich geladen.
   * Label-Definitionen werden erfolgreich aus der externen Datei (JSON/YAML) geladen.
   * Textlabel werden korrekt den Objekten anhand der Namenskonvention zugeordnet und im 3D-Raum in der Nähe der Objekte angezeigt.
   * Die Label bleiben bei Objekttransformationen (Verschiebung, Rotation, Skalierung) korrekt an den Objekten positioniert.
   * Die Label sind lesbar

### Fail Criteria:
   * Label können nicht korrekt den Objekten zugeordnet werden.
   * Label bewegen sich nicht synchron mit den Objekten.
   * Die externe Konfiguration der Label ist nicht umsetzbar.

### Fallbacks:
   * Manuelle Platzierung von statischen HTML-Elementen als Label.
   * Reduktion der Detailtiefe der Label oder Verzicht auf Label für bestimmte Objekte.
   * Nutzung von Tooltips, die nur bei Mouse-Over erscheinen, anstatt permanenter Label.