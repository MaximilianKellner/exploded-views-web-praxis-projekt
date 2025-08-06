## Label mit Hervorhebung und Informationskarten

### Problem:
   * Nutzer benötigen eine intuitive Möglichkeit, geklickte Komponenten des 3D-Modells zu identifizieren und zugehörige Informationen abzurufen.
   * Geklickte Komponenten müssen deutlich hervorgehoben werden, um sie vom Rest des Modells zu unterscheiden.
   * Labels überdecken das 3D-Modell.

### Scope:
   * Laden eines 3D-Modells (`.glb`-Datei).
   * Laden von Label-Definitionen aus einer externen Datei (JSON oder YAML).
   * Testen verschiedener Hervorhebungsmethoden für selektierte Komponenten
   * Gestaltung und Animation einer Informationskarte
   * Integration eines Darkmode/Lightmode-Umschalters mit entsprechender Anpassung der UI-Elemente

### Resources:
   * Three.js
   * Tweakpane
   * Anime.js
   * CSS-Variables
   * JSON-Konfigurationsdateien für Modell- und Karteninformationen

### Description:
   * Dieser POC testet verschiedene Methoden zur visuellen Hervorhebung ausgewählter 3D-Komponenten und implementiert ein responsives Kartensystem, das zugehörige Informationen anzeigt. Durch Klicken auf eine Komponente wird diese hervorgehoben und eine animierte Informationskarte erscheint mit Details zur Komponente.

### Success Criteria:
   * Nutzer können einzelne Komponenten durch Klicken auswählen
   * Ausgewählte Komponenten werden deutlich hervorgehoben
   * Informationskarten werden animiert eingeblendet und zeigen korrekte Informationen zur ausgewählten Komponente
   * Darkmode/Lightmode-Umschaltung funktioniert konsistent für alle UI-Elemente
   * Das System funktioniert flüssig ohne Leistungsprobleme

### Fail Criteria:
   * Komponenten können nicht zuverlässig ausgewählt werden
   * Hervorhebungen sind nicht deutlich genug oder verursachen visuelle Artefakte
   * Informationskarten zeigen falsche oder keine Informationen
   * Theme-Umschaltung führt zu inkonsistentem Erscheinungsbild
   * Performance-Probleme bei komplexen Modellen

### Fallbacks:
   * Alte POCs mit alternativen Labeldarstellungen 