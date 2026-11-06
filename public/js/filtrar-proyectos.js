// Jerarquía Organización -> Proyecto: al elegir una organización se ocultan
// los proyectos que no le pertenecen (data-org en cada option).
// Sin JS se ven todos; al guardar, el servidor deriva la organización desde
// el proyecto, así que la coherencia no depende de este archivo.
const org = document.getElementById("idOrganizacion");
const sel = document.getElementById("idProyecto");

if (org && sel) {
  const opciones = [...sel.options].filter((o) => o.dataset.org);

  const aplicar = () => {
    const elegida = org.value;
    opciones.forEach((o) => {
      o.hidden = Boolean(elegida) && o.dataset.org !== elegida;
    });
    const actual = sel.selectedOptions[0];
    if (actual && actual.hidden) sel.value = "";
  };

  // En edición el proyecto precargado manda: la organización se alinea con él
  const precargado = sel.selectedOptions[0];
  if (precargado && precargado.dataset.org && precargado.dataset.org !== org.value) {
    org.value = precargado.dataset.org;
  }

  aplicar();
  org.addEventListener("change", aplicar);
  sel.form?.addEventListener("reset", () => setTimeout(aplicar));
}
