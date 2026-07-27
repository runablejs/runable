<script lang="ts" setup>
console.log(useRuntime());
</script>

<template>
  <RouterLink to="/hello/yes">to hello yes</RouterLink>
  <div style="max-width: 662px; margin: 100px auto">
    <h1>Pourquoi @syora/vue ?</h1>

    <p>
      Aujourd'hui, faire le choix de Nuxt implique d'adopter Nitro comme runtime
      serveur. Si ce couplage est cohérent pour une grande majorité de projets,
      il devient une véritable contrainte lorsque l'on souhaite s'appuyer sur un
      framework backend plus spécialisé (comme Fastify, NestJS, AdonisJS ou
      Koa).
    </p>

    <p>
      Ces frameworks backend offrent des écosystèmes riches et éprouvés :
      injection de dépendances avancée, architecture modulaire, systèmes de
      plugins matures, et des conventions robustes déjà adoptées par les
      entreprises.
    </p>

    <p>
      Face à ce besoin d'infrastructure spécifique, les développeurs se
      retrouvent coincés entre deux options insatisfaisantes:
    </p>

    <ul>
      <li>
        Le retour au "Vue.js pur" : Vous choisissez la liberté du serveur, mais
        vous renoncez à l'expérience développeur (DX) exceptionnelle de Nuxt
        (routage basé sur les fichiers, auto-imports, useAsyncData, modules,
        middlewares, etc.).
      </li>

      <li>
        L'approche des projets séparés (Headless) : Vous développez votre
        backend idéal d'un côté et un frontend Nuxt de l'autre, au prix d'une
        architecture lourde, d'une complexité de déploiement accrue et d'une
        duplication des logiques.
      </li>
    </ul>

    <p>@syora/vue est né pour supprimer ce compromis.</p>

    <p>
      Ce framework apporte toute l'expérience développeur de Nuxt directement à
      Vue.js, tout en restant strictement indépendant du serveur. Vous conservez
      le routage automatique, les layouts, les middlewares, l'hydratation
      asynchrone, le Server-Side Rendering (SSR) et les auto-imports. La seule
      différence ? Vous êtes libre d'exécuter l'application sur le serveur de
      votre choix.
    </p>

    <p>
      Que votre architecture repose sur Fastify, NestJS, AdonisJS, Express, Koa,
      Hono, ou toute autre technologie capable de traiter des requêtes HTTP,
      @syora/vue s'y intègre naturellement.
    </p>

    <p>
      Le résultat est simple : Choisissez votre backend pour ses qualités
      intrinsèques, sans jamais renoncer au confort de développement de Nuxt.
    </p>
  </div>
</template>
