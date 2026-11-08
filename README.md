# Cifras y Letras
Una app web para ponerte a prueba y jugar tu misma a los juegos de palabras y números de la misma manera que se hace en el concurso de televisión de RTVE "Cifras y Letras". Lo bueno, que puedes probar tantas veces como quieras. Lo malo, que no aparecen los maravillosos Aitor Albizua, ni David Calle ni Elena Herraiz, y dudo que acepten de ninguna manera tener sus "clones digitales" en este repo.

## Índice
1. [Preámbulo](#preambulo)
2. [Prerrequisitos](#prerrequisitos)
3. [Instalación y uso en local](#instalacion-y-uso-en-local-o-para-desarrollo)
4. [Docker y "Containerización"](#docker-y--containerizacion-)
5. [Descargo de responsabilidad](#disclaimer--descargo-de-responsabilidad)

## Preámbulo
Lectura totalmente **opcional**, puedes ir directo a los [Prerrequisitos](#prerrequisitos)

Este proyecto empieza un fin de semana de noviembre, en el que después de unos meses de ir experimentando
y probando interacciones con diferentes modelos de lenguaje en un sistema con hardware bastante _limitado_ (16GB VRAM), he querido hacer una prueba más práctica de las capacidades reales de estas herramientas sin tener que gastarse (o invertir) 6000 pavazos en un RTX Spark ni depender de un contaminante y poco sostenible _datacenter_ (los agentes usados han corrido 100% en local).

Soy un fan del programa "Cifras y Letras", concurso de televisión que empecé a ver cuando iba al cole, y que ahora se emite en La 2 de Televisión Española (RTVE), y he querido hacer un pequeño experimento para ver si es posible llevar a cabo un proyecto de este calibre en el escaso tiempo libre que tengo, potenciando mis conocimientos de programación con un agente LLM, en este caso "gemma-4-12b-it-GGUF" (usando la cuantización Q5_K_XL). El modelo se puede descargar de Hugging Face: [google/gemma-4-12B-it](https://huggingface.co/google/gemma-4-12B-it) y con la cuantización Q5 funciona de fábula en una GPU que tenga almenos 16GB de VRAM. Si bien es un modelo generalista que no está especializado en código, la verdad es que me está dando unos resultados muy por encima de mis expectativas. He probado algo similar con Qwen 2.5 Coder, WizardCoder, Devstral y ni se acercan. Por ahora, este modelo es el que mejor resultado me ha dado para hacer la gestión completa de un proyecto, desde la arquitectura inicial, al código. (Bueno, y que también ofrece una ventana de contexto generosa). Por supuesto, aún me queda mucho por probar, pero por ahora, estoy cómodo con este.

Estamos en 2026 y hay que reconocer que las cosas han cambiado de la hostia desde que por allá a finales de los años 80 empecé a dar mis primeros pasos programando BASIC en un Amstrad CPC 6128 con 128KB de RAM. Sí, "KB", así es, **KILO**bytes... Aunque las bases teóricas de la IA empiezan por ahí a mediados del siglo XX con Alan Turing, y el imaginario se remonta miles de años atrás con el mito de Prometeo, es hoy en día cuando disponemos del hardware y la tecnología necesarias para poder materializarla y darle un uso práctico, cuando hace 40 años atrás disponer de algo así era pura ciencia-ficción. Así que, por qué no aprovechar esta oportunidad?

Tradicionalmente he sido bastante escéptico con esta tecnología, sobretodo por motivos éticos, ya que considero que a fecha de hoy, los principales desarrolladores de estas tecnologías no están siendo lo suficientemente responsables para garantizar transparencia y un uso seguro en beneficio de todos y que garantice el bien común, así como las implicaciones en cuanto a seguridad, sesgo, especulación económica, exceso de codicia, afán de poder y otras materias que nunca tienen importancia hasta que el problema o los peligros que pueden provocar se hacen realidad.

Por suerte hoy en día, que existan modelos de pesos abiertos está democratizando el acceso a la IA. Soy firme defensor del movimiento _Open Source_, y creo que es un pilar del progreso en general, ya que permite que la tecnología sea un bien común. Si quitas las barreras de acceso, la innovación deja de ser un privilegio de pocos y se convierte en una herramienta universal. Y ahí es a donde deberíamos avanzar todos. De ahí que el proyecto tenga una licencia MIT, que es la licencia que menos dolores de cabeza da, y de las más permisivas.

Este preámbulo me sirve también como dosis de humildad para mi mismo, -inicialmente bastante detractor de los modelos de IA-, para dar cuenta de cómo nos está cambiando esta tecnología, cuando la usamos de buena fe y como lo que es, una herramienta que te asiste. No es una historia de sumisión, sino más bien de aceptación y dejar atrás la resistencia al cambio. Quiero seguir estudiando y progresar con esta tecnología y hacer todo aquello que siempre he soñado hacer, pero que he dejado en el tintero por no disponer de tiempo (ni dinero, ni equipo) suficiente para materializarlo. 

También escribo este preámbulo (y lo pongo deliberadamente al principio del README), con la intención de dejar por escrito mi "autodefensa" de la mala fama que tiene el "vibecoding". Si bien es cierto que la parte "dura" del proceso, -que es picar el código-, no ha salido de la punta de mis dedos, sí que me he encargado de tunear la IA de acuerdo con mi hardware, probar decenas de otros modelos, diseñar el proyecto inicial, plantear la arquitectura, leer (y entender) el código generado, avanzar iteración tras interación con el "Agentic Loop" y obviamente realizar tareas divertidas como corregir bugs, y no tan divertidas (según se mire), como el QA. Al fin y al cabo, por A o por B, currar, se sigue currando. No es darle a un botón y que todo se haga de manera mágica. Si fuera así, perdería la gracia. Además, lo hago por hobby y pura diversión y no tengo que rendir cuentas a nadie.

En conclusión, no voy a profundizar ni a filosofar más en este humilde README. Dicho esto y que ya he podido dar mi opinión de manera abierta sobre el tema, vamos a detallar las instrucciones del repositorio.

## Prerrequisitos
- Python 3.10 o superior
- pip
- venv

## Instalación y uso en local o para desarrollo
- Clonar el repo (sin este primer paso, mal):
```
git clone <url-del-repositorio>
cd cifrasyletras
```
- Crear y activar el entorno virtual:
```
python3 -m venv venv
source venv/bin/activate
```
- Una vez dentro del venv, instalar las dependencias:
```
pip install -r requirements.txt
```
- Luego inicializar la base de datos SQLite:
```
python scripts/init_db.py
```
- Lanzar el servidor:
```
uvicorn backend.main:app --reload
```
- Finalmente, abrir un navegador e introducir la siguiente URL:
```
http://localhost:8000/
```

## Docker y "Containerización"
El proyecto se puede "Dockerizar" para poderlo desplegar de manera fácil, o bien usarlo en tu máquina local sin tener que instalar dependencias, aunque sí que probablemente tendrás que generar almenos la
base de datos SQLite.

### Prerequisitos para Docker
- Docker installed
- Docker Compose installed
- O bien, Docker Desktop.

### Método 1: Docker Compose (Sota-Caballo-Rey)
Si usas docker-compose es lo más fácil, porque ya se encarga de todo "automágicamente". No hace falta bindear puertos ni comerse la cabeza.

**Hace el build y arranca la aplicación**
```bash
docker-compose up --build
```

**Puedes ejecutarlo en modo "Detached" (lo que viene a ser en segundo plano)**
```bash
docker-compose up -d --build
```

**Parar y quitar los contenedores**
```bash
docker-compose down
```

### Método 2: Comandos por separado (hacerlo a "manija")
Si prefieres tener más control y usarlo sin Compose, puedes hacerlo también manualmente:

**Cosntruir la imagen:**
```bash
docker build -t cifras-y-letras .
```

**Poner en marcha el contenedor:**
```bash
docker run -p 8000:8000 --name game_instance cifras-y-letras
```

**Parar el contenedor:**
```bash
docker stop game_instance
```

## Disclaimer / Descargo de responsabilidad
**English:**
This repository and the name "Cifras y Letras" are not affiliated with, sponsored by, or endorsed by the television program or any company associated with the same name. This is an independent project created for personal and experimental purposes and is not intended to replace, mimic, or represent the official brand.

**Español:**
Este repositorio y el nombre "Cifras y Letras" no están afiliados, patrocinados ni respaldados por el programa de televisión o cualquier empresa asociada con el mismo nombre. Este es un proyecto independiente creado con fines personales y experimentales, y no pretende sustituir, imitar ni representar la marca oficial.