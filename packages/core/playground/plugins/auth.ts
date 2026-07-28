export default defineVuePlugin({
  hooks: {
    "app:mounted": () => {
      console.log("hello from plugin hook");
    },
  },

  setup: () => {
    console.log("hello from plugin++");

    return {
      provide: {
        test: () => "hey is test",
      },
    };
  },
});
