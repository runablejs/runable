export async function getRoot() {
  const { default: Root } = await import("./App.vue");

  return Root;
}
