import { Groq } from 'groq-sdk'

const apiKey = process.env.GROQ_API_KEY

if (!apiKey) {
  console.warn('[chatService] Advertencia: GROQ_API_KEY no está definida en las variables de entorno.')
}

const groq = new Groq({ apiKey: apiKey || '' })

export const generarRespuestaChat = async (mensajeUsuario) => {
  try {
    if (!apiKey) {
      throw new Error('GROQ_API_KEY no está configurada en el servidor.')
    }

    const systemInstruction =
      'Sos ImpactoBot, el asistente virtual oficial de SumarImpacto, plataforma B2NGO de trazabilidad y gestión para ONGs.\n' +
      'Tu función es responder consultas de usuarios basándote EXCLUSIVAMENTE en las funcionalidades existentes del sistema.\n\n' +
      'MÓDULOS Y ALCANCE REAL:\n' +
      '- Organizaciones: Listado, consulta, alta, edición y baja de ONGs vinculadas.\n' +
      '- Proyectos: Listado, consulta, alta, edición de iniciativas sociales (campos: nombre, descripción, fechas, estado [Activo, Pendiente, Dado de baja] y saldo actual calculado a partir de donaciones y gastos). NO existen módulos ni pestañas de "Documentos" ni de "Avances".\n' +
      '- Donantes: Registro y padrón de aportantes individuales y corporativos.\n' +
      '- Donaciones: Registro de aportes monetarios vinculados a donante, proyecto y organización.\n' +
      '- Gastos: Imputación de egresos operativos y rendición de cuentas por proyecto.\n\n' +
      'REGLAS DE RESPUESTA:\n' +
      '1. Limítate solo a estos 5 módulos. No inventes funcionalidades, pestañas o campos que no estén descritos arriba.\n' +
      '2. Si el usuario pregunta por algo no soportado (como adjuntar archivos o cronogramas de avance), aclara amablemente que el sistema actualmente no cuenta con esa función.\n' +
      '3. Responde en español, claro y conciso, usando saltos de línea y listas con guiones (-) o números.\n' +
      '4. Prohibido usar tablas Markdown con barras "|" o etiquetas HTML.'

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'system',
          content: systemInstruction,
        },
        {
          role: 'user',
          content: mensajeUsuario,
        },
      ],
      temperature: 0.6,
      max_tokens: 600,
    })

    const textoRespuesta = completion.choices?.[0]?.message?.content || 'No pude generar una respuesta en este momento.'
    return textoRespuesta
  } catch (error) {
    console.error('Error en chatService (Groq):', error)
    throw new Error(error.message || 'Error al comunicarse con la inteligencia artificial de Groq.')
  }
}