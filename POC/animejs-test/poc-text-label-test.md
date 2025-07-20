## POC: Integration von Anime.js

### Problem:
   * Die Implementierung von Animationen, insbesondere für benutzergesteuerte Ereignisse wie `onClick`, erfordert erweiterte    Steuerungsmöglichkeiten, wie zum Beispiel Easing-Funktionen, um eine flüssige und ansprechende User Experience zu gewährleisten.

### Scope
   * Integration eines Animations-Triggers (Button) in die Tweakpane-GUI.
   * Anwendung von Anime.js zur Animation einer JavaScript-Objekteigenschaft (`expFactor`).
   * Testen verschiedener Easing-Funktionen zur Steuerung des Animationsverlaufs.
   * Überprüfung der Echtzeit-Synchronisation zwischen dem animierten Wert und der GUI-Anzeige (Slider).

### Resources:
   * Animationsbibliothek: Anime.js
   * UI-Bibliothek: Tweakpane
   * Bestehende Projektumgebung

### Description:
   * Dieser Proof of Concept dient der Evaluierung der Animationsbibliothek Anime.js für den Einsatz im Projekt. Es wird die grundlegende Funktionalität geprüft, indem der `expFactor` per Button-Klick animiert wird. Der Fokus liegt auf der korrekten Implementierung, der Anwendung von Easing-Effekten und der Aktualisierung der Benutzeroberfläche.

### Success Criteria:
   * Die Animation des `expFactor`-Wertes von 0 auf 1 startet erfolgreich nach einem Klick auf den "Start"-Button.
   * Die Animation verläuft über eine definierte Zeitspanne mit einem klar erkennbaren Easing-Effekt.
   * Der "Progress"-Slider in der Tweakpane-GUI wird während der Animation kontinuierlich und synchron aktualisiert.
   * Es treten keine Konsolenfehler im Zusammenhang mit dem Import oder der Ausführung von Anime.js auf.

### Fail Criteria:
   * Die Animation startet nicht oder bricht mit einem Laufzeitfehler ab.
   * Die GUI (Tweakpane-Slider) reflektiert den Animationsfortschritt nicht oder nur verzögert.

### Fallbacks:
   * **Alternative Bibliothek:** Evaluierung einer anderen Animationsbibliothek wie GSAP oder Motion.dev.
   * **Manuelle Implementierung:** Umsetzung der Animation mittels `requestAnimationFrame` und selbst definierten Easing-Funktionen.