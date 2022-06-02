<template>
  <div>
    <h1>Introduction</h1>
    <p>
      SnakeEyes is a fork of Zeppelin, a private moderation bot. SnakeEyes is modified to fit the needs of the RAZER Discord server.
    </p>

    <!-- WIP bar -->
    <div class="px-3 py-2 rounded bg-gray-800 shadow-md inline-block">
      <alert class="inline-icon mr-1 text-yellow-300" title="Note!" />
      This documentation is a work in progress.
    </div>

    <h2>Getting the bot</h2>
    <p>
      You cannot get access to this specific instance of Zeppelin (SnakeEyes).<br>
    </p>

    <h2>Configuration</h2>
    <p>
      All SnakeEyes configuration is done through the dashboard by editing a YAML config file. By default, only the server
      owner has access to this, but they can give other users access as they see fit. See <router-link to="/docs/configuration/configuration-format">Configuration format</router-link> for more details.
    </p>

    <h2>Plugins</h2>
    <p>
      SnakeEyes is divided into plugins: grouped functionality that can be enabled/disabled as needed, and that have their own configurations.
    </p>

    <h2>Commands</h2>
    <p>
      The commands for each plugin are listed on the plugin's page (see "Plugins" on the menu). On these pages, the command prefix is assumed to be <code>!</code> but this can be changed on a per-server basis.
    </p>
  </div>
</template>

<script lang="ts">
  import Alert from 'vue-material-design-icons/Alert.vue';

  export default {
    components: { Alert },
  };
</script>
