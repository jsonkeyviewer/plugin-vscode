# Project Context

*Created: 2026-07-07*

---

## What we are building

Nom du plugin: ConfigKeyViewer

- Formats pris en charge dès le MVP: JSON et YAML (et possiblement TOML, INI, XML à venir)
- Fonctionnalités
    1) Tooltip au survol
        - Quand le curseur est sur une clé JSON ou YAML, calculer le chemin dot notation depuis la racine.
        - Afficher le chemin dans une infobulle (tooltip) au survol du mot-clé.
        - Optionnel: afficher le type de valeur (string, number, object, array).
    2) Débordement dans la gutter
        - Afficher le chemin complet sur la gutter de la ligne correspondante.
        - Option: tooltip sur l’icône gutter ou texte direct dans la gutter (si feasible).
        - Cache du chemin et recalcul lors des modifications du document (via onDidChangeTextDocument et les arbres AST de VS Code).
- Architecture et API VS Code
    - Language Features:
        - DocumentSymbolProvider ou onHoverProvider pour le tooltip.
        - Decorator ou CodeLens/gutter decorations équivalentes pour l’affichage dans la gutter (VS Code utilise decorations et line decorations).
    - Analyse des contenus:
        - JSON: via le arbre JSON intégré de VS Code ou JSON language service.
        - YAML: via YAML language service (ex: vscode-yaml, ou intégration du YAML LS).
    - Performance:
        - Calcul incrémentiel et caching par fichier.
        - Invalidation via onDidChangeTextDocument et events de validation YAML/JSON.
- Configuration utilisateur
    - Activer/daser tooltip et gutter
    - Choix de l’affichage gutter: texte, icône + tooltip, ou les deux
    - Chemin en dot notation obligatoire (option pour formats alternatifs à l’avenir)
- Dépendances et packaging
    - TypeScript ou JavaScript (TypeScript recommandé)
    - package.json pour les contributions (contributes.languages, contributes.configuration, contributes.views, etc.)
    - Activation events: onLanguage: json, yaml
- Format de livraison
    - Squelette MVP (extension.json, package.json, src/extension.ts)
    - Démonstrations de parsing JSON et YAML simples
    - Tests unitaires de resolver (Chemin JSON/YAML)

Livrables envisagés
- README.md spécifique VS Code (différences d’UX vs IntelliJ)
- Squelette de projet VS Code extension (TypeScript)
- Exemples de cas de tests (JSON/YAML simples)
- Plan de déploiement et publication sur VS Code Marketplace

Prochaines étapes (option)
- Voulez-vous que je fournisse:
    - Un squelette complet MVP en TypeScript pour VS Code?
    - Des variantes de nom adaptées à VS Code et une description courte pour la marketplace?
    - Un comparatif rapide des choix UI (texte gutter vs icône) adaptés à VS Code?

---

## Stack & conventions

*(describe the stack, language, framework, key rules)*

---

## Team rules

*(describe how the agent should work: language, code style, what it must never do)*