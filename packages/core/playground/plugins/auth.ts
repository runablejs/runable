export default defineVuePlugin({
  hooks: {
    "app:mounted": () => {
      console.log("++++++++++++++++++++++++++è_________");
    },
  },

  setup: () => {
    return {
      provide: {
        test: () => "hey is test",
      },
    };
  },
});
