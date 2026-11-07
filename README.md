# Cifras y Letras
Una app web para ponerte a prueba y jugar tu mismo a los juegos de palabras o números de la misma manera que se hace en el concurso de televisión de RTVE "Cifras y Letras". Lo bueno, que puedes probar tantas veces como quieras. Lo malo, que no aparecen ni Aitor Albizua, ni David Calle ni Elena Herraiz!

## Disclaimer / Descargo de responsabilidad
**English:**
This repository and the name "Cifras y Letras" are not affiliated with, sponsored by, or endorsed by the television program or any company associated with the same name. This is an independent project created for personal and experimental purposes and is not intended to replace, mimic, or represent the official brand.

**Español:**
Este repositorio y el nombre "Cifras y Letras" no están afiliados, patrocinados ni respaldados por el programa de televisión o cualquier empresa asociada con el mismo nombre. Este es un proyecto independiente creado con fines personales y experimentales, y no pretende sustituir, imitar ni representar la marca oficial.

## Preámbulo
Este proyecto empieza un fin de semana de noviembre, en el que después de unos meses de ir experimentando
y probando interacciones con diferentes modelos de lenguaje en un sistema con hardware bastante limitado (16GB VRAM), he querido hacer una prueba más práctica de las capacidades reales de estas herramientas.

Soy un fan del programa "Cifras y Letras", concurso de televisión que empecé a ver cuando era un niño, y que ahora se emite en La 2 de Televisión Española (RTVE), y he querido hacer un pequeño experimento para ver si es posible llevar a cabo un proyecto de este calibre en el escaso tiempo libre que tengo, potenciando mis conocimientos de programación con un agente LLM, en este caso "gemma-4-12b-it-GGUF" (usando la cuantización Q5_K_XL). El modelo se puede descargar de Hugging Face: [google/gemma-4-12B-it](https://huggingface.co/google/gemma-4-12B-it) y con la cuantización Q5 funciona de fábula en una GPU que tenga almenos 16GB de VRAM.

Estamos en 2026 y hay que reconocer que las cosas han cambiado mucho desde que era un niño por allá en los finales de los años 80 y empecé a dar mis primeros pasos programando en BASIC en un Amstrad CPC 6128 con 128KB de RAM. Aunque las bases teóricas de la IA empiezan por ahí a mediados del siglo XX con Alan Turing, y el imaginario se remonta miles de años atrás con el mito de Prometeo, es hoy en día cuando disponemos del hardware y la tecnología necesarias para poder materializarla y darle un uso práctico, cuando hace 40 años atrás disponer de algo así era pura ciencia-ficción. Así que, por qué no aprovechar esta oportunidad?

Tradicionalmente he sido bastante escéptico con esta tecnología, sobretodo por motivos éticos, ya que considero que a fecha de hoy, los principales desarrolladores de estas tecnologías no están siendo lo suficientemente responsables para garantizar un uso responsable en beneficio de todos y que garantice el bien común, así como las implicaciones en cuanto a seguridad, sesgo y otras materias que nunca tienen importancia hasta que el problema o los peligros que pueden provocar se hacen realidad.

Pero bueno, no estoy tampoco para filosofar sobre el tema. Por suerte hoy en día, que existan modelos de pesos abiertos está democratizando el acceso a la IA. Soy firme defensor del movimiento _Open Source_ , y creo que es un pilar del progreso en general, ya que permite que la tecnología sea un bien común. Si quitas las barreras de acceso, la innovación deja de ser un privilegio de pocos y se convierte en una herramienta universal. Y ahí es a donde deberíamos avanzar todos. De ahí que el proyecto tenga una licencia MIT, que 

En conclusión, este preámbulo me sirve también como dosis de humildad para mi mismo, -inicialmente bastante detractor de los modelos de IA-, para dar cuenta de cómo nos está cambiando esta tecnología, cuando la usamos de buena fe. No es una historia de sumisión, sino más bien una de aceptación. Me apetece poder estudiar y usar esta tecnología para poder hacer todo aquello que siempre he soñado hacer, pero que he dejado en el tintero por no disponer de tiempo suficiente para materializarlo. También es un escrito para "autodefenderme" un poco de la mala fama que tiene el "vibecoding". Si bien es cierto que la parte "dura" del proceso, -que es picar el código-, no ha salido de la punta de mis dedos, sí que me he encargado de diseñar el proyecto inicial, plantear la arquitectura, leer el código generado y obviamente realizar tareas divertidas como corregir bugs, y no tan divertidas (según se mire), como el QA. Al fin y al cabo, lo hago por hobby y pura diversión y no tengo que rendir cuentas a nadie.

Dicho esto y que ya he podido dar mi opinión de manera abierta sobre el tema, vamos a detallar las instrucciones del repositorio.

