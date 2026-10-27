// Avisos de los formularios como globito nativo del navegador, sin cuadro de errores aparte.
//
// Atributos que lee en cada <input>:
//   pattern + data-mensaje-formato : formato válido y el mensaje a mostrar si no lo cumple
//   data-error-servidor            : mensaje que devolvió el servidor para ese campo (ej. CUIL repetido);
//                                    se muestra apenas se abre la página
// El servidor sigue validando todo igual; esto solo avisa antes (o después) de enviar el formulario.
const campos = document.querySelectorAll('form input[type="text"], form input[type="email"]');

campos.forEach((input) => {
  // Saca los espacios de los costados (el servidor también los descarta)
  const limpiar = () => {
    input.value = input.value.trim();
  };

  input.addEventListener("blur", limpiar);

  // Al fallar el formato, reemplaza el mensaje genérico del navegador por el nuestro.
  // Si el navegador ya tiene un mensaje propio más claro (ej. al correo le falta la @), se respeta.
  input.addEventListener("invalid", () => {
    const v = input.validity;
    if (v.customError) return;
    if (v.patternMismatch && !v.typeMismatch && input.dataset.mensajeFormato) {
      input.setCustomValidity(input.dataset.mensajeFormato);
    }
  });

  // Apenas la persona vuelve a escribir, se quita el mensaje para que se revalide el campo
  input.addEventListener("input", () => input.setCustomValidity(""));

  // Limpia también al apretar Guardar o Enter, antes de que el navegador valide
  input.form?.addEventListener("click", (evento) => {
    if (evento.target.matches('[type="submit"]')) limpiar();
  });
});

// Errores que detectó el servidor: se muestran como globito sobre el primer campo afectado
const conErrorDelServidor = [...document.querySelectorAll("input[data-error-servidor]")];
conErrorDelServidor.forEach((input) => input.setCustomValidity(input.dataset.errorServidor));
if (conErrorDelServidor.length > 0) {
  conErrorDelServidor[0].focus();
  conErrorDelServidor[0].reportValidity();
}
