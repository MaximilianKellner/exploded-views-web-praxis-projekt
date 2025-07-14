## TITEL: Integration einer GUI mit Tweakpane

### Problem:
   * Das Anpassen von Szenenparametern wie Licht, Kamera oder Farben erfordert derzeit eine manuelle Änderung im Code oder in JSON-Dateien, gefolgt von einem Neuladen der Seite. Dieser Prozess ist langsam, unübersichtlich und nimmt Zeit in anspruch.

### Scope:
   * Integration einer grafischen Benutzeroberfläche zur 
   dynamischen Anpassung von Szenenparametern in Echtzeit.
   * Anpassung der Hintergrundfarbe der Szene.
   * Anpassung der Eigenschaften (Intensität, Farbe, Position) der Lichter.

### Resources:
   * [Tweakpane-Bibliothek](https://tweakpane.github.io/docs/)
   * `scene-config.json` als Datenquelle.

### Description:
   * Es wird die `tweakpane`-Bibliothek in das Projekt eingebunden. Ein neues Modul (`UiHandler.js`) wird erstellt, das für die Initialisierung der GUI zuständig ist. Dieses Modul liest die geladene Konfiguration (`scene-config.json`) und die erstellten Three.js-Lichtobjekte ein. Basierend auf diesen Daten generiert es dynamisch UI-Elemente wie Slider, Farbwähler und Vektor-Steuerungen. Diese UI-Elemente werden direkt an die Eigenschaften der Three.js-Objekte (z.B. `light.intensity` oder `scene.background`) gebunden, sodass Änderungen in der GUI sofort und ohne Neuladen in der 3D-Szene sichtbar sind.

### Success Criteria:
   * Nach dem Start der Anwendung erscheint ein GUI-Panel auf dem Bildschirm.
   * Die GUI zeigt die korrekten Anfangswerte aus der `scene-config.json` an.
   * Das Ändern eines Wertes in der GUI (z.B. die Intensität eines Lichts) führt zu einer sofortigen visuellen Änderung in der 3D-Szene.
   * Die Anwendung bleibt stabil und es treten keine Konsolenfehler im Zusammenhang mit der GUI auf.

### Fail Criteria:
   * Die GUI wird nicht angezeigt oder verursacht einen Laufzeitfehler, der die Anwendung blockiert.
   * Änderungen in der GUI haben keine Auswirkung auf die 3D-Szene.
   * Die Performance der Anwendung bricht durch die GUI merklich ein.

### Fallbacks:
   * Sollte die Integration von Tweakpane fehlschlagen oder zu komplex sein, wird auf die manuelle Konfiguration über die `scene-config.json` zurückgegriffen, welche dann mit einer eigens entwikelten lösung bearbeitet wird, wie sie bereits in vorherigen POCs existiert hat.