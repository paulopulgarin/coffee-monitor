# Protocolo integrado de monitoreo de cafetales
## Neblina Forest Reserve — Támesis, Antioquia

**Versión 3.0 — consolidada** · 2026-09

| | |
|---|---|
| **Predio** | 17 ha · 1840–2200 m · 360 m de relieve |
| **Área en café** | 0.6 ha (~3000 plantas) |
| **Lotes** | Papayo-L1 (1300 m²) · Chiroso-L3a + Etíope-L2b (3595 m²) |
| **Plataformas aéreas** | DJI Mavic 3 Classic · DJI Mini 4 Pro |
| **Posicionamiento** | Red de 9 monumentos permanentes · GNSS |
| **Software** | Agisoft Metashape · QGIS · Python/GDAL · Coffee Monitor (Next.js + Supabase) |

---

# PARTE I — MARCO

## 1. División de trabajo entre instrumentos

El principio que gobierna todo el protocolo: **cada instrumento mide solo lo que su física le permite medir.**

| Dominio | Instrumento | Por qué |
|---|---|---|
| Geometría, posición, conteo | **Dron RGB** | Medición directa sobre imagen georreferenciada. Objetiva, censal, repetible. |
| Estructura de la planta (altura, copa, volumen) | **Dron RGB** | El modelo de altura de dosel mide una propiedad física real. |
| Terreno (pendiente, orientación, drenaje, sombra) | **Dron RGB** | Fotogrametría entrega un DTM muy superior a SRTM. Imposible de levantar a pie. |
| Cartografía base | **Dron RGB** | Ortomosaico como capa base del visor y de todo reporte. |
| Sanidad: plagas y enfermedades | **Terrestre exclusivo** | Requiere ver el envés de la hoja, la lesión, el insecto. Ningún sensor RGB nadir lo resuelve. |
| Vigor y estado fisiológico | **Terrestre exclusivo** | Diagnóstico visual entrenado, no inferencia por color. |
| Fenología, floración, cosecha | **Terrestre exclusivo** | — |
| Nutrición | **Laboratorio** | Análisis foliar y de suelos. |

**Consecuencia operativa:** el dron genera alertas **geométricas** (planta ausente, copa reducida, crecimiento detenido) que se verifican a pie. Toda la información sanitaria nace y muere en campo.

## 2. Las tres preguntas del monitoreo

| Pregunta | Variable de estado | Fuente primaria | Validación |
|---|---|---|---|
| ¿Cuántas plantas vivas hay? | Mortalidad, densidad | Dron (censo geométrico) | Barrido censal a pie |
| ¿Cuánto crecieron? | Altura, copa, tallo, cruces | Submuestra a pie | CHM del dron, calibrado |
| ¿Están sanas? | Vigor, plagas, enfermedades | **Terrestre** | Diagnóstico dirigido, laboratorio |

## 3. Estados fenológicos y validez de las métricas

Variedades especiales (Chiroso, Etíope, Papayo), probablemente en levante o inicio de producción.

| Etapa | Edad | Detección individual por dron | CHM confiable |
|---|---|---|---|
| Almácigo | 0–6 meses | No | No |
| **Levante** | 6–18 meses | **Sí, óptima** | **Sí — suelo visible entre plantas** |
| Producción temprana | 18–36 meses | Sí, con GSD < 1 cm | Sí, degradándose |
| Producción plena | > 36 meses | No — copas traslapadas | Solo por franja |

Registra el estado fenológico por lote en la tabla `lotes`. Determina qué métricas del dron son válidas y cuándo hay que migrar de conteo individual a métricas por surco.

---

# PARTE II — DISEÑO DE MUESTREO

## 4. Estructura de tres niveles

| Nivel | Alcance | Frecuencia | Esfuerzo | Qué mide |
|---|---|---|---|---|
| **1 — Submuestra permanente** | 195 plantas marcadas (8 %) | Mensual | 3–4 h | Crecimiento + sanidad completos |
| **2 — Barrido censal** | 3000 plantas (100 %) | Trimestral | 4–5 h | Presencia/ausencia de 6 condiciones |
| **3 — Diagnóstico dirigido** | Ad hoc | Por alerta | Variable | Causa específica, laboratorio |
| **Censo aéreo** | 3000 plantas (100 %) | Trimestral | 25 min vuelo | Geometría, posición, estructura |

Los cuatro se complementan: el nivel 1 da series temporales finas, el nivel 2 da mapas de incidencia censales, el nivel 3 cierra diagnósticos, y el censo aéreo da inventario y estructura.

## 5. Estratificación espacial

| Estrato | Área | Plantas est. | Submuestra | Frecuencia |
|---|---|---|---|---|
| Papayo-L1 | 1300 m² | ~650 | 50 | Mensual |
| Chiroso-L3a | ~2000 m² | ~1000 | 80 | Mensual |
| Etíope-L2b | ~1595 m² | ~800 | 65 | Mensual |
| **Total** | **4895 m²** | **~2450** | **195 (8 %)** | |

> Ajusta las plantas estimadas al conteo real del primer censo aéreo. La cifra asume marco de 1.0 × 2.0 m (5000 pl/ha). Si tu marco es distinto, recalcula.

## 6. Selección de la submuestra permanente

**No uses aleatorio simple.** En 360 m de relieve, la posición topográfica domina el crecimiento; un muestreo aleatorio puede sobrerrepresentar una franja y sesgar todas las tasas.

**Muestreo sistemático estratificado por posición topográfica:**

```
1. Dividir cada lote en tres franjas altitudinales (alta / media / baja)
   usando el DTM del vuelo de línea base
2. Dentro de cada franja, seleccionar surcos cada n surcos
   (n = surcos_totales_de_la_franja / plantas_objetivo_de_la_franja × 5)
3. En cada surco seleccionado, marcar plantas cada 5 posiciones
4. Excluir la primera y la última planta de cada surco (efecto borde)
5. Verificar que la distribución final cubra las tres franjas
   en proporción al área de cada una
```

**Marcado físico obligatorio.** Etiqueta de aluminio o plástico UV-resistente con código QR o ID grabado, atada al tallo con hilo o cinta floja.

> **Nunca uses alambre.** Estrangula el tallo en crecimiento y mata la planta que estabas monitoreando.

**Formato de ID:** `{LOTE}-{SURCO}-{POSICIÓN}` → `PAP-04-12`, `CHI-11-03`

Es autoexplicativo en campo, permite reubicar una planta sin GPS, y ordena naturalmente el recorrido.

**Georreferenciación de la submuestra:** una vez marcadas, levanta la coordenada de cada una. Con el primer vuelo procesado, corrígelas al centroide detectado por el dron (±10–20 cm) — mucho mejor que cualquier GPS de mano.

---

# PARTE III — PROTOCOLO TERRESTRE

## 7. Nivel 1 — Submuestra permanente (mensual)

### 7.1 Equipo de campo

| Ítem | Uso |
|---|---|
| Vara graduada o cinta métrica de 3 m | Altura |
| Calibrador digital / pie de rey (0.1 mm) | Diámetro de tallo |
| Cinta métrica de 1.5 m | Diámetro de copa |
| Teléfono con Coffee Monitor (PWA offline) | Captura de datos |
| Tarjeta de color estándar | Referencia en fotos |
| Lupa 10× | Broca, minador, ácaros |
| Bolsas de papel + marcador | Muestras a laboratorio |
| Pintura blanca / marcador permanente | Marca de altura de medición del tallo |
| Alcohol al 70 % + trapo | Desinfección del calibrador entre plantas |

> **Desinfectar el calibrador entre plantas no es opcional.** *Ceratocystis fimbriata* (llaga macana) se transmite por herramientas. Un calibrador contaminado puede propagar la enfermedad a lo largo de toda la submuestra.

### 7.2 Variables de crecimiento

Todas las plantas de la submuestra, todos los meses.

| Variable | Campo BD | Unidad | Método | Precisión |
|---|---|---|---|---|
| Altura | `altura_cm` | cm | Base del tallo a nivel del suelo hasta el ápice del eje ortotrópico. **No estirar la planta.** | ±1 cm |
| Diámetro de tallo | `diametro_tallo_mm` | mm | Calibrador a **5 cm sobre el suelo**, en la marca permanente de pintura. Dos medidas perpendiculares, promediar. | ±0.1 mm |
| Diámetro de copa N-S | `diametro_copa_ns_cm` | cm | Proyección de la copa, eje norte-sur | ±2 cm |
| Diámetro de copa E-O | `diametro_copa_eo_cm` | cm | Proyección de la copa, eje este-oeste | ±2 cm |
| Número de cruces | `num_cruces` | conteo | Pares de ramas plagiotrópicas en el eje principal | entero |
| Ramas productivas | `num_ramas_prod` | conteo | Solo en producción: ramas con nudos florales o frutos | entero |

**Notas de método:**

- **La marca de 5 cm en el tallo es permanente.** Se pinta una vez, al establecer la submuestra. Sin ella, cada mes mides a una altura ligeramente distinta y el diámetro parece fluctuar sin razón.
- **`num_cruces` es el mejor predictor de potencial productivo en levante** y toma tres segundos contarlo. No lo omitas.
- El diámetro de copa se mide sobre la proyección vertical, no sobre la rama más larga. Extiende la cinta al suelo bajo el borde de la copa.

### 7.3 Variables de sanidad

Todas las plantas de la submuestra, todos los meses.

| Variable | Campo BD | Escala | Definición |
|---|---|---|---|
| Vigor | `vigor` | 1–5 | **5** follaje denso verde oscuro, brotación activa · **4** follaje denso, brotación moderada · **3** follaje normal, sin brotación · **2** follaje ralo, hojas pequeñas · **1** defoliación >50 %, sin brotes |
| Clorosis | `clorosis_pct` | 0–100 | % de hojas con amarillamiento visible |
| Defoliación | `defoliacion_pct` | 0–100 | % de área foliar perdida respecto a planta sana comparable del mismo lote |
| Roya | `roya_severidad` | 0–4 | *Hemileia vastatrix* — pústulas naranja-amarillas en el **envés**. **0** ausente · **1** <5 % de hojas · **2** 5–20 % · **3** 20–50 % · **4** >50 % |
| Ojo de gallo | `ojo_gallo_severidad` | 0–4 | *Mycena citricolor* — manchas circulares pardas con cabecillas amarillas. Misma escala. **Crítico a tu altitud y bajo sombra.** |
| Minador | `minador_severidad` | 0–4 | *Leucoptera coffeella* — galerías serpenteantes en hojas. Misma escala. |
| Broca | `broca_pct` | 0–100 | % de frutos perforados en muestra de 30 frutos. Solo en producción. |
| Llaga macana | `llaga_macana` | 0/1 | *Ceratocystis fimbriata* — marchitez súbita del follaje, chancro o lesión oscura en el tallo. **Reportar de inmediato.** |
| Deficiencia nutricional | `deficiencia_nutric` | texto | N / P / K / Mg / Ca / B / Zn / ninguna — por patrón visual |
| Otros | `notas` | texto | Cochinilla, ácaros, mal rosado, daño mecánico, daño por granizo |

**Guía rápida de patrones de deficiencia:**

| Elemento | Patrón visual |
|---|---|
| N | Clorosis uniforme, hojas viejas primero, planta pequeña |
| P | Hojas viejas verde oscuro opaco a bronceado, crecimiento lento |
| K | Necrosis en bordes y ápices de hojas viejas |
| Mg | Clorosis internervial en hojas viejas, nervadura verde |
| Ca | Deformación y muerte de brotes terminales |
| B | Muerte de yemas terminales, hojas pequeñas y deformes, entrenudos cortos |
| Zn | Hojas terminales pequeñas, angostas, entrenudos muy cortos (rosetas) |

Esto es orientación de campo, no diagnóstico. El análisis foliar (§10) confirma.

### 7.4 Estado de la planta

`estado` ∈ {`viva_sana`, `viva_estres`, `viva_enferma`, `muerta`, `resembrada`, `no_localizada`}

> **Distinguir `muerta` de `no_localizada` es crítico.** Contar como muerta una planta que simplemente no encontraste infla artificialmente la tasa de mortalidad y arruina el indicador que probablemente reportas a tus financiadores.

### 7.5 Fotografía estandarizada

Una foto mensual por planta de la submuestra:

```
Distancia:      1.5 m del tallo
Altura cámara:  1.2 m
Azimut:         SIEMPRE desde el norte de la planta
                (marcar la posición del fotógrafo con estaca)
Encuadre:       Planta completa + tarjeta de color en el borde inferior
Hora:           09:00–11:00 o 14:00–16:00
Evitar:         Cenit solar, contraluz, lluvia reciente
```

Esta serie fotográfica es un activo mayor de lo que parece: sirve para reentrenar modelos, para auditoría de reportes de financiación, y para diagnóstico retrospectivo cuando aparece un problema que nadie vio venir.

### 7.6 Orden del recorrido

Recorre siempre en el mismo orden (por lote, por surco ascendente, por posición ascendente). Reduce el tiempo, evita omisiones, y hace que las series temporales tengan hora de captura consistente.

## 8. Nivel 2 — Barrido sanitario censal (trimestral)

**Este es el corazón del sistema sanitario.** Al no usar el dron para detectar problemas de salud, el barrido censal es lo que produce mapas de incidencia sobre las 3000 plantas y permite detectar focos espaciales antes de que se dispersen.

### 8.1 Método

Recorrido surco por surco registrando **únicamente presencia/ausencia** de seis condiciones. Sin medir. Sin fotografiar salvo hallazgo relevante.

```
Por planta, marcar solo si aplica:
  [ ] Ausente / muerta
  [ ] Roya evidente (equivalente a severidad ≥2)
  [ ] Ojo de gallo evidente (equivalente a severidad ≥2)
  [ ] Marchitez o chancro en tallo → posible llaga macana   ← CRÍTICO
  [ ] Defoliación severa (>50 %)
  [ ] Clorosis generalizada
```

Registro a nivel `{lote, surco, posición}`. Con una interfaz de captura de un toque por condición y avance automático, **3000 plantas toman 4–5 horas** — una jornada con dos personas.

**Requisito de diseño de la app:** registrar una planta debe tomar menos de 2 segundos. Si toma más, el barrido se vuelve inviable y el sistema se abandona en el segundo trimestre.

### 8.2 Productos del barrido

- Incidencia censal (%) de cada condición, por lote
- Mapa de puntos de plantas afectadas
- Mapa de calor de focos
- Lista de posiciones vacías → contrastar con el mapa de faltantes del dron
- Detección de agregación espacial (§8.3)

### 8.3 Detección de focos

```python
from scipy.spatial import cKDTree
import numpy as np

# afectadas_xy: coordenadas proyectadas (EPSG:3116) de plantas con la condición
tree = cKDTree(afectadas_xy)

# Un foco = 3 o más plantas afectadas dentro de un radio de 10 m
focos = []
for i, p in enumerate(afectadas_xy):
    vecinos = tree.query_ball_point(p, r=10.0)
    if len(vecinos) >= 3:
        focos.append(i)

print(f"Plantas en foco: {len(set(focos))} de {len(afectadas_xy)} afectadas")
```

Un foco dispara alerta de severidad alta y activa el Nivel 3. La diferencia entre plantas afectadas dispersas y plantas afectadas agregadas es la diferencia entre un problema tolerable y un brote en curso.

## 9. Nivel 3 — Diagnóstico dirigido (ad hoc)

### 9.1 Disparadores

| Origen | Condición |
|---|---|
| Dron | Planta ausente en vuelo t2 pero presente en t1 |
| Dron | ΔCHM < 5 cm en 3 meses |
| Dron | Δárea de copa < −20 % |
| Barrido censal | Foco detectado (≥3 plantas en radio de 10 m) |
| Barrido censal | Cualquier marchitez de tallo → **inmediato** |
| Submuestra | Vigor ≤2 en dos observaciones consecutivas |
| Externo | Evento climático (granizo, vendaval, deslizamiento) |

### 9.2 Procedimiento

```
1. Generar ruta de inspección (exportar GPX desde la plataforma)
2. En cada planta:
   · Examen con lupa 10× (envés de hojas, axilas, tallo, frutos)
   · Fotografía de detalle del síntoma con escala
   · Registro en observación con tipo 'diagnostico_dirigido'
3. Si hay sospecha de llaga macana:
   · NO podar ni herir la planta
   · Marcar y aislar la herramienta usada
   · Tomar muestra de tejido de la zona de transición sano/enfermo
   · Enviar a laboratorio
4. Si hay foco confirmado:
   · Delimitar la extensión en el mapa
   · Definir medida de manejo
   · Registrar en tabla `manejo`
   · Programar reinspección a 30 días
```

### 9.3 Muestreo para laboratorio

| Análisis | Muestra | Conservación |
|---|---|---|
| Identificación de hongo | Tejido de la zona de transición sano/enfermo, 5×5 cm | Bolsa de papel, seco, ambiente |
| Nematodos | Raíces + suelo rizosférico, 500 g | Bolsa plástica, refrigerado |
| Virus / bacteria | Hojas sintomáticas jóvenes | Bolsa plástica con papel absorbente, refrigerado |

Nunca bolsa plástica sellada para material fúngico: se pudre en tránsito y el laboratorio no puede aislar el patógeno objetivo.

## 10. Análisis foliar y de suelos

| Análisis | Frecuencia | Muestreo |
|---|---|---|
| **Suelos completo** — pH, MO, N, P, K, Ca, Mg, S, B, Zn, Cu, Fe, Mn, CIC, textura | Anual (julio) | 1 muestra compuesta por lote: 15–20 submuestras a 0–20 cm, en zigzag, evitando bordes y sitios de fertilización localizada |
| **Foliar** | Semestral (abril, octubre) | **Tercer par de hojas** desde el ápice, en ramas del **tercio medio** de la planta. 30 plantas por lote, 4 hojas por planta. Muestrear a la misma hora del día. |

Sin esto, ninguna interpretación de vigor está completa. Es la base fisiológica que ni el dron ni la inspección visual sustituyen.

Registrar resultados en la tabla `analisis_laboratorio` y vincularlos al lote y a la fecha, para poder cruzarlos después con las series de crecimiento.

## 11. Registro de manejo agronómico

Toda intervención se registra: fertilización, control de arvenses, podas, regulación de sombra, control fitosanitario, resiembra.

**Sin este registro, las series de crecimiento no son interpretables.** Un salto en el crecimiento tras una fertilización es información valiosa; el mismo salto sin registro de la fertilización es ruido inexplicable.

Campos mínimos: fecha, lote, tipo, producto, dosis, área tratada, costo, responsable.

---

# PARTE IV — PROTOCOLO DE DRON

## 12. Selección de plataforma

| Criterio | Mavic 3 Classic | Mini 4 Pro |
|---|---|---|
| Sensor | 4/3" CMOS, 20 MP | 1/1.3" CMOS, 48 MP |
| Tamaño de píxel | 3.28 µm | 1.19 µm |
| GSD @ 40 m | ~1.1 cm | ~0.7 cm |
| GSD @ 22 m | ~0.6 cm | ~0.4 cm |
| Autonomía real | ~35 min | ~25 min |
| Estabilidad en viento | Alta | Baja |
| Ruido a ISO alto | Bajo | Alto |
| **Rol** | **Censo trimestral, ortomosaico de referencia** | **Detalle semestral, parcelas de calibración, zonas restringidas** |

El sensor 4/3 gana en calidad de reconstrucción geométrica y en estabilidad. El Mini 4 Pro gana en GSD nominal pero su sensor pequeño introduce ruido que degrada la correlación fotogramétrica en zonas de bajo contraste.

## 13. Vuelo de censo — Mavic 3 Classic (trimestral)

```
Altura AGL:              40 m  (terrain follow activado)
GSD resultante:          ~1.1 cm/px
Traslape frontal:        85 %
Traslape lateral:        80 %
Velocidad:               4 m/s
Orientación de líneas:   PARALELA a las curvas de nivel
Ángulo de cámara:        −90° (nadir)
Vuelo cruzado:           SÍ — segunda pasada a 90° de la primera
Modo de disparo:         Intervalo, activado en el dron
Formato:                 RAW DNG + JPEG
ISO:                     100 (fijo)
Obturación:              ≥ 1/1000 s
Balance de blancos:      FIJO — nunca automático
Exposición:              Manual, fijada antes del despegue
Hora:                    10:00–14:00 hora local
Cielo:                   Uniformemente nublado O uniformemente despejado
```

**Cuatro decisiones que no son negociables:**

**Líneas paralelas a las curvas de nivel.** Con 360 m de relieve, volar perpendicular obliga al terrain-follow a corregir altitud dentro de cada línea, lo que degrada el traslape efectivo y es la causa probable de que `executeHeight` en WaypointMap supere el techo de 500 m. Paralelo a curvas mantiene cada línea a altitud casi constante.

**Vuelo cruzado.** Duplica el tiempo pero es lo que permite reconstruir la geometría de copas individuales. Sin él, el CHM presenta artefactos direccionales sistemáticos.

**Exposición y balance de blancos fijos.** Si el dron ajusta entre fotos, el ortomosaico queda con parches de tono y la segmentación por ExG produce resultados distintos en distintas zonas de la misma imagen. Eso rompe el conteo.

**Cielo uniforme.** Nubes parciales generan parches de sombra móviles entre fotos, que producen artefactos de reconstrucción y errores de segmentación. **Con cielo parcialmente nublado, cancela el vuelo.**

Con dos baterías y 4895 m² de café, el vuelo cruzado a 40 m cabe cómodamente. Sobra autonomía; inviértela en el traslape alto.

## 14. Vuelo de detalle — Mini 4 Pro (semestral)

```
Altura AGL:            22 m
GSD:                   ~0.4 cm/px
Traslape:              85 % frontal / 80 % lateral
Velocidad:             3 m/s
Cobertura:             3 parcelas de calibración de 20×20 m (una por lote)
Pasadas:               Nadir (−90°) + oblicua (−60°)
```

La pasada oblicua reconstruye la estructura lateral de la copa, que el nadir puro no captura. Solo se hace en las parcelas de calibración por costo de procesamiento.

## 15. Checklist pre-vuelo

```
CONDICIONES
[ ] Cielo uniforme (100 % nublado o 100 % despejado)
[ ] Viento < 6 m/s
[ ] Sin lluvia en las últimas 2 h
[ ] Ventana horaria 10:00–14:00

EQUIPO
[ ] 2 baterías cargadas + control cargado
[ ] Tarjeta SD formateada, >64 GB libres
[ ] Firmware actualizado

RED GEODÉSICA
[ ] 9 monumentos desmalezados (1.5 m alrededor) y visibles
[ ] Paneles removibles colocados (si aplica)
[ ] Foto oblicua de cada monumento con código visible
[ ] Estado físico de cada monumento registrado

CÁMARA
[ ] Exposición manual fijada (histograma sin recorte)
[ ] Balance de blancos fijado
[ ] ISO 100, obturación ≥1/1000
[ ] Formato RAW+JPEG

MISIÓN
[ ] Terrain follow activado, DEM cargado
[ ] Líneas paralelas a curvas de nivel
[ ] executeHeight < 400 m en todos los waypoints
[ ] Vuelo cruzado programado

REGISTRO
[ ] Punto de despegue anotado
[ ] Hora de inicio anotada
[ ] Condición de cielo y viento anotadas
```

---

# PARTE V — RED DE ANCLAJE GNSS

## 16. Principio: precisión relativa, no absoluta

**No necesitas saber dónde está tu finca en el mundo con precisión centimétrica.** Necesitas que la ortofoto de enero y la de abril describan el mismo espacio.

```
Error absoluto  → afecta cruce con catastro, límites legales, otros datasets
                → tolerancia aceptable: ±1.5 m

Error relativo  → afecta TODO el análisis de cambio
                → tolerancia requerida: < 3 cm
```

La estrategia que consigue error relativo centimétrico con equipo de ±1.5 m: **coordenadas congeladas.** Se miden una vez, se documentan, y se reutilizan idénticas en todos los vuelos. El sesgo absoluto queda incorporado por igual en cada época y se cancela al restar.

## 17. Diseño de la red

**Nueve monumentos:**

| Rol | Cantidad | Ubicación |
|---|---|---|
| Control perimetral | 5 | Vértices del área de café + el punto más alejado |
| Control central | 2 | Interior, no colineales con los perimetrales |
| **Verificación (check points)** | **2** | Interior, **excluidos del ajuste** |

**Reglas de distribución:**

- Cubrir el rango altitudinal completo. Un GCP mal distribuido en vertical produce efecto domo en el DSM.
- Nunca colineales — tres puntos en línea no restringen la rotación.
- Al menos uno fuera del bloque principal pero dentro de la cobertura, para controlar los bordes.
- Separación mínima entre monumentos: 25 m.
- Sin dosel encima ni sombra proyectada permanente.

**Los dos check points son innegociables.** El RMSE que reporta Metashape sobre los puntos de control es optimista por construcción: esos puntos participaron en el ajuste. El error real lo miden los check points.

## 18. Construcción del monumento

**Opción A — Placa de concreto (permanente)**

```
1. Excavar 40 × 40 × 25 cm
2. Vaciar concreto (1 cemento : 2 arena : 3 gravilla)
3. Antes de fraguar, insertar varilla de 3/8" de 40 cm
   sobresaliendo 1 cm — este es el punto físico exacto
4. Enrasar a nivel del suelo circundante
5. Marcar el centro exacto en la varilla con punzón
6. Grabar el código (GCP-01 … GCP-09) en el concreto fresco
7. Fraguar 7 días antes de pintar
8. Pintar la diana centrada en la varilla
```

**Opción B — Panel removible sobre punto fijo**

```
1. Varilla de 3/8" × 50 cm clavada, sobresaliendo 2 cm,
   con collar de concreto de 20 cm de diámetro
2. Panel de PVC espumado o aluminio compuesto de 60 × 60 cm
   con perforación central de 10 mm
3. En cada vuelo se ensarta el panel sobre la varilla:
   queda perfectamente centrado
4. Entre vuelos el panel se guarda
```

La Opción B mantiene mejor contraste en el tiempo. La Opción A no requiere logística en cada vuelo, pero la diana pintada se degrada y hay que repintarla cada 12–18 meses.

## 19. Diseño de la diana

**Regla de dimensionamiento:** el objetivo debe medir **al menos 40 píxeles de lado** en la imagen.

| Plataforma | Altura | GSD | Mínimo | Recomendado |
|---|---|---|---|---|
| Mavic 3 Classic | 40 m | 1.1 cm | 44 cm | **60 × 60 cm** |
| Mavic 3 Classic | 60 m | 1.6 cm | 64 cm | **80 × 80 cm** |
| Mini 4 Pro | 22 m | 0.4 cm | 16 cm | **40 × 40 cm** |

Dimensiona para el vuelo **más alto** que planees hacer.

**Patrón:** damero de cuatro cuadrantes; el centro geométrico es el punto medido y coincide con la varilla.

```
┌─────────┬─────────┐
│█████████│         │
│█████████│         │
├─────────●─────────┤   ● = varilla = punto exacto
│         │█████████│
│         │█████████│
└─────────┴─────────┘
```

**Pintura:**

- **Mate obligatorio.** El brillo produce reflexión especular que satura y desplaza el centroide detectado.
- Cuadrantes claros: **gris claro (RGB ≈ 220,220,220)**, no blanco puro — el blanco se quema a ISO 100 bajo sol directo y pierde el borde.
- Cuadrantes oscuros: negro mate.
- Esmalte acrílico exterior o pintura de tráfico.

**Alternativa superior — objetivos codificados de Metashape.** Metashape detecta automáticamente objetivos circulares codificados de 12 bits (`Tools → Markers → Print Markers`). Impresos a escala en material rígido, el software los identifica y numera solo en cada vuelo.

Elimina el marcado manual de 9 objetivos × 30+ fotos cada uno — entre 2 y 3 horas por vuelo, y la principal fuente de error humano del procesamiento. **Recomendación fuerte: usa objetivos codificados.**

## 20. Medición de las coordenadas

El Garmin de mano no registra observables crudos (RINEX), así que no admite post-proceso diferencial. Opciones por calidad:

### Opción 1 — GNSS RTK/PPK alquilado (recomendada)

Un día con un Emlid Reach RS2/RS3 o equivalente resuelve la red completa con precisión centimétrica, para siempre.

- Alquiler en Medellín: COP 150.000–300.000/día
- Corrección: red CORS del IGAC vía NTRIP, o post-proceso contra la estación permanente más cercana
- Tiempo: 5 min/punto en RTK fijo · 20 min/punto en estático para PPK
- **Media jornada, una sola vez, para toda la vida del proyecto**

Si el proyecto tiene financiación atada a métricas espaciales, es un gasto trivial que eleva permanentemente la calidad del dataset.

### Opción 2 — Garmin con promediado extendido

```
Por cada monumento:
  1. Receptor sobre trípode o bípode, antena centrada sobre la varilla
  2. Esperar convergencia: EPE < 3 m
  3. Función de promediado de waypoint
  4. Ocupación mínima: 20 minutos continuos
  5. Registrar: coordenada, EPE final, satélites, PDOP, hora

Repetir el ciclo completo en TRES sesiones:
  · Sesión A: mañana (08:00–10:00)
  · Sesión B: tarde del mismo día (14:00–16:00)
  · Sesión C: otro día, ≥4 h de diferencia horaria con las anteriores

Coordenada final    = media de las tres sesiones
Dispersión entre sesiones = estimador honesto del error
```

Las tres sesiones en horarios distintos rompen la correlación de la geometría satelital. La media converge a ~±1.0–1.5 m horizontal. **Si la dispersión supera 4 m en algún punto, ese monumento está en zona de multitrayectoria — reubícalo.**

### Opción 3 — Densificación local por distancias (complemento)

Mejora la **geometría interna** de la red sin equipo geodésico:

```
1. Medir con distanciómetro láser todas las distancias entre pares
   de monumentos visibles entre sí (mínimo 15 distancias para 9 puntos)
2. Precisión: ±2 cm (láser) o ±5 cm (cinta bien tensada)
3. Ajustar la red por mínimos cuadrados: coordenadas GNSS como
   aproximación inicial, distancias como observaciones fuertes
4. Resultado: red internamente consistente a nivel centimétrico,
   con posición absoluta todavía de ±1.5 m
```

La escala y la forma interna quedan rígidas; el bloque completo simplemente está desplazado 1.5 m del mundo real — desplazamiento idéntico en todos los vuelos, que se cancela en el análisis de cambio.

En 0.6 ha con 9 monumentos, medir 15 distancias con láser toma una hora. **Vale la pena aunque uses RTK.**

### Componente vertical

La altura GNSS es 2–3 veces peor que la horizontal y el Garmin no aplica modelo geoidal confiable.

```
1. Adoptar datum vertical LOCAL ARBITRARIO:
   GCP-01 = 100.000 m (valor convencional)
2. Determinar alturas relativas de los demás por nivelación con
   manguera de nivel o nivel óptico. Precisión: ±2 cm
3. Documentar explícitamente que el datum es local
```

El CHM no se afecta: `CHM = DSM − DTM`, ambos del mismo vuelo, el sesgo vertical se cancela. El análisis de cambio tampoco, porque el datum es idéntico en todas las épocas. Si algún día necesitas alturas ortométricas reales, una sola ocupación con receptor geodésico sobre GCP-01 transforma toda la red.

## 21. Mantenimiento de la red

| Tarea | Frecuencia |
|---|---|
| Desmalezar 1.5 m alrededor de cada monumento | Antes de cada vuelo |
| Fotografiar cada monumento (oblicua, código visible) | Cada vuelo |
| Verificar integridad física | Cada vuelo |
| Repintar dianas | Cada 12–18 meses |
| **Re-medir coordenadas** | **Nunca**, salvo daño físico confirmado |

Si un monumento se destruye, **no lo re-midas en aislamiento.** Reconstrúyelo y determina su coordenada por intersección desde los monumentos vecinos usando distancias con láser. Así permanece dentro del marco de referencia congelado.

---

# PARTE VI — PROCESAMIENTO

## 22. Fotogrametría (Agisoft Metashape)

Sobre el protocolo de 12 pasos existente, ajustes específicos:

| Paso | Ajuste |
|---|---|
| Alinear fotos | Alta precisión, ajuste adaptativo de cámara |
| **Importar GCPs** | **Antes de optimizar.** Reference pane → Import, EPSG:3116 |
| **Detectar objetivos** | Automático si son codificados; manual en 8–12 fotos por objetivo si son pintados |
| **Precisión de marcadores** | `0.02 m` si mediste con RTK · `1.50 m` si con Garmin promediado · `0.5 px` en imagen |
| **Desactivar check points** | Desmarcar GCP-08 y GCP-09 en Reference |
| Optimize Cameras | Después de marcar. Objetivo: error de reproyección < 1 px |
| Nube densa | Calidad **Alta** (no Ultra — no aporta y triplica el tiempo). Filtrado moderado |
| **Clasificar puntos suelo** | **Paso obligatorio.** Max angle 15° · Max distance 0.5 m · Cell size 3 m |
| DTM | Generar **solo desde puntos clasificados como suelo** |
| DSM | Generar desde la nube densa completa |
| Ortomosaico | Superficie: DSM · Blending: mosaic · **Color correction DESACTIVADO** |
| Exportación | GeoTIFF, EPSG:3116, sin compresión con pérdida |

> **Declarar mal la precisión de los marcadores es el error más común.** Si pones 0.005 m con datos de Garmin, el ajuste deforma el modelo para forzar coordenadas que no son tan buenas. El valor le dice al ajuste cuánta confianza dar a los GCPs.

**Productos por vuelo:**
```
ortho_{lote}_{YYYYMMDD}.tif    Ortomosaico RGB
dsm_{lote}_{YYYYMMDD}.tif      Modelo de superficie
dtm_{lote}_{YYYYMMDD}.tif      Modelo de terreno
chm_{lote}_{YYYYMMDD}.tif      Modelo de altura de dosel
report_{lote}_{YYYYMMDD}.pdf   Reporte de calidad de Metashape
```

## 23. Criterios de aceptación del vuelo

| Métrica | Umbral | Si falla |
|---|---|---|
| Error de reproyección | < 1.0 px | Descartar fotos borrosas, realinear |
| RMSE en **check points**, horizontal | < 3 × GSD (≈3.3 cm a 40 m) | Revisar marcado de objetivos |
| RMSE en **check points**, vertical | < 5 × GSD (≈5.5 cm) | Revisar distribución vertical de GCPs |
| Objetivos detectados | 9 de 9 | Si <7, **repetir vuelo** |
| Fotos alineadas | > 98 % | Revisar traslape |

Registrar los cinco valores en la tabla `vuelos`. Son el certificado de calidad del dataset. **Si el RMSE en check points supera 5 cm, el vuelo no sirve para detección de crecimiento.**

## 24. Modelo de altura de dosel

```python
import rasterio
import numpy as np

with rasterio.open('dsm_papayo_20260401.tif') as src:
    dsm = src.read(1)
    profile = src.profile

with rasterio.open('dtm_papayo_20260401.tif') as src:
    dtm = src.read(1)

chm = dsm - dtm
chm[chm < 0]   = 0        # ruido bajo el terreno
chm[chm > 4.0] = np.nan   # árboles de sombra, no café

profile.update(dtype='float32', count=1, nodata=np.nan)
with rasterio.open('chm_papayo_20260401.tif', 'w', **profile) as dst:
    dst.write(chm.astype('float32'), 1)
```

**Validación obligatoria:** extrae el CHM en las coordenadas de las 195 plantas de la submuestra y regresa contra `altura_cm` medida a pie. Objetivo: **R² > 0.75**. Si es menor, revisa la clasificación de suelo del DTM.

Esa regresión es tu modelo de calibración: convierte CHM a altura estimada para las ~2800 plantas que no mediste.

```python
from sklearn.linear_model import LinearRegression
import numpy as np

# chm_p95: percentil 95 del CHM dentro de la máscara de cada planta
# altura_campo: altura medida a pie, mismo mes
modelo = LinearRegression().fit(chm_p95.reshape(-1,1), altura_campo)
r2 = modelo.score(chm_p95.reshape(-1,1), altura_campo)
rmse = np.sqrt(np.mean((modelo.predict(chm_p95.reshape(-1,1)) - altura_campo)**2))

print(f"R² = {r2:.3f}   RMSE = {rmse:.1f} cm")
print(f"altura_cm = {modelo.coef_[0]:.2f} × CHM_cm + {modelo.intercept_:.2f}")
```

> **Percentil 95, no máximo.** El píxel más alto de una copa suele ser ruido de reconstrucción o una rama aislada. El p95 es mucho más estable entre fechas.

## 25. Segmentación y detección

### 25.1 Los índices RGB: operador de segmentación, no indicador de vigor

```python
r = R/(R+G+B);  g = G/(R+G+B);  b = B/(R+G+B)

ExG  = 2*g - r - b                              # separación verde/suelo
ExGR = ExG - (1.4*r - g)                        # mejor rechazo de suelo rojizo
CIVE = 0.441*r - 0.811*g + 0.385*b + 18.787     # robusto a variación de iluminación
```

**Uso correcto:**
```
máscara_vegetación = ExG > umbral_Otsu
máscara_café       = máscara_vegetación AND (0.2 m < CHM < 3.0 m)
máscara_sombrío    = máscara_vegetación AND (CHM > 3.0 m)
máscara_suelo      = NOT máscara_vegetación
```

**Por qué NO se usan como índices de vigor:**

1. No miden clorofila; estiman color aparente. Un cafeto sano bajo sombra y uno clorótico a pleno sol pueden dar el mismo valor.
2. No son comparables entre fechas sin calibración radiométrica estricta.
3. No distinguen causa: roya, ojo de gallo, deficiencia de N y estrés hídrico producen respuestas indistinguibles en RGB.
4. La vista nadir no ve dónde está el problema: la roya coloniza el envés, el ojo de gallo empieza en el estrato bajo, la broca está dentro del fruto.
5. Sombra proyectada, suelo húmedo, arvenses y hojarasca generan falsos positivos estructurales.

### 25.2 Detección de plantas — método por umbral

```
1. Máscara de vegetación:   ExG > umbral de Otsu
2. Filtro de altura:        0.2 m < CHM < 3.0 m
3. Intersección
4. Apertura morfológica (elimina ruido)
5. Watershed sobre CHM para separar copas contiguas
6. Extracción de centroides y área de copa
7. Filtro por área mínima (descarta arvenses)
```

Con café en levante y suelo visible entre surcos, alcanza **85–95 % de detección correcta**. **Pruébalo antes de invertir en IA.**

### 25.3 Detección con IA (solo si el umbral queda bajo 85 %)

- Anotación: SAM asistido, 150–200 plantas por lote
- Modelo: YOLOv8/v9 segmentación
- Entrenamiento sobre teselas de 640×640 px
- Aumentación: rotación, escala, brillo (no flip horizontal si hay dirección de surco marcada)
- Validación: hold-out de un lote completo, no split aleatorio

### 25.4 Emparejamiento con la base de datos

```python
from scipy.spatial import cKDTree

tree = cKDTree(plantas_bd_xy)                              # EPSG:3116
dist, idx = tree.query(detecciones_xy, distance_upper_bound=0.6)

emparejadas   = detecciones[dist < 0.6]
nuevas        = detecciones[dist >= 0.6]
no_detectadas = set(range(len(plantas_bd))) - set(idx[dist < 0.6])
```

Umbral de 60 cm = mitad de la distancia de siembra. Ajústalo a tu marco real.

**`no_detectadas` es la lista de candidatas a mortalidad — no mortalidad confirmada.** Puede ser oclusión por sombrío o falla del detector. Se confirma en el barrido censal.

## 26. Métricas extraíbles de RGB — inventario completo

### 26.1 Productos primarios

| Producto | Precisión | Uso |
|---|---|---|
| Ortomosaico | Relativa <2 cm · absoluta ±1.5 m | Capa base, cartografía, reportes |
| DSM | ±5–10 cm relativa | Insumo para CHM |
| DTM | ±10–20 cm | Pendiente, drenaje, insumo CHM |
| Nube de puntos densa | 200–800 pts/m² a 40 m | Análisis 3D |

### 26.2 Inventario y posición

| Métrica | Confiabilidad |
|---|---|
| Conteo de plantas | 85–95 % en levante |
| Coordenada de cada planta | ±10–20 cm relativa |
| Mapa de faltantes (gaps) | Alta |
| Densidad real por lote | Alta |
| Detección de surcos (Hough) | Alta en siembra regular |
| Distancia real entre plantas | ±10 cm |

### 26.3 Estructura

| Métrica | Método | Precisión |
|---|---|---|
| Altura de planta | p95 del CHM en la máscara | ±5–15 cm |
| Diámetro de copa | `2·√(área/π)` | ±10 cm |
| Área de copa proyectada | Píxeles × área de píxel | ±5 % |
| Volumen aparente de copa | `Σ(CHM_píxel × área_píxel)` | Relativa |
| Cobertura de dosel (%) | Área vegetal / área del lote | ±3 % |
| Suelo expuesto (%) | Complemento | ±3 % |

### 26.4 Terreno y contexto

**Este bloque es donde el dron aporta valor que ningún recorrido a pie iguala.**

| Producto | Uso agronómico |
|---|---|
| Pendiente (%) | Estratificación del muestreo, riesgo de erosión, diseño de conservación |
| Orientación (aspecto) | Horas de sol, microclima, explica variación entre franjas |
| Curvatura | Cóncavo = acumulación de agua · convexo = drenaje rápido, estrés hídrico |
| **Índice topográfico de humedad (TWI)** | **Predice zonas encharcadas → riesgo de llaga macana y ojo de gallo** |
| Insolación potencial | Horas de radiación por sitio y época |
| Red de drenaje | Ubicación de zanjas, cárcavas incipientes |
| Inventario de sombríos | Conteo, altura y área de copa de árboles de sombra |
| **Porcentaje de sombra** | **Determina incidencia de ojo de gallo, maduración y perfil de taza** |
| Sombra proyectada por hora | Mapa de horas de sol efectivas por planta |

> **El mapa de porcentaje de sombra es probablemente el producto de mayor valor agronómico del sistema.** A 1840–2200 m la regulación de sombra gobierna la sanidad y la calidad. Medirlo a pie es inviable; sale directo del CHM.

### 26.5 Detección de cambio

| Producto | Interpretación |
|---|---|
| `ΔCHM_p95` por planta | Crecimiento vertical |
| `Δárea_copa` por planta | Expansión o pérdida de follaje |
| `Δcobertura_dosel` por lote | Progreso del cierre del cafetal |
| Presente en t1, ausente en t2 | Candidata a mortalidad |
| Ausente en t1, presente en t2 | Resiembra |
| `Δporcentaje_sombra` | Efecto de podas de sombrío |

**Umbrales de interpretación (ΔCHM en 3 meses):**

| ΔCHM | Interpretación | Acción |
|---|---|---|
| > +15 cm | Crecimiento vigoroso | Ninguna |
| +5 a +15 cm | Crecimiento normal | Ninguna |
| 0 a +5 cm | Crecimiento detenido | Alerta → verificar a pie |
| −5 a 0 cm | Posible defoliación | Inspección prioritaria |
| < −5 cm | Pérdida de copa severa | Inspección inmediata |
| Sin dato en t2 | Candidata a mortalidad | Verificar en barrido |

Recalibra estos umbrales con tus propios datos después de dos ciclos.

## 27. Co-registro entre épocas

Aunque uses GCPs congelados, **verifica siempre la alineación real:**

```python
import numpy as np

# ≥10 puntos homólogos invariantes (rocas, postes, esquinas, monumentos)
dx = x_t2 - x_t1
dy = y_t2 - y_t1

print(f"Desplazamiento medio: ΔX={np.mean(dx):.3f} m  ΔY={np.mean(dy):.3f} m")
print(f"Desviación:           σX={np.std(dx):.3f} m  σY={np.std(dy):.3f} m")

assert abs(np.mean(dx)) < 0.03 and abs(np.mean(dy)) < 0.03, \
    "Desplazamiento sistemático — revisar GCPs antes de analizar cambio"
```

Un ΔCHM calculado sobre ortofotos desalineadas 20 cm produce falsos crecimientos y falsas pérdidas en los bordes de cada copa — que es justo donde está la señal. **Si hay desplazamiento sistemático >3 cm, no analices el cambio hasta corregirlo.**

---

# PARTE VII — MODELO DE DATOS

Esquema final consolidado. PostgreSQL + PostGIS (Supabase).

## 28. Unidades espaciales

```sql
CREATE TABLE lotes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo          TEXT UNIQUE NOT NULL,        -- 'PAP','CHI','ETI'
  nombre          TEXT NOT NULL,
  variedad        TEXT,
  area_m2         NUMERIC,
  fecha_siembra   DATE,
  etapa_fenologica TEXT,                       -- 'almacigo','levante','prod_temprana','prod_plena'
  marco_siembra_m NUMERIC,
  densidad_plha   INT,
  altitud_min_m   INT,
  altitud_max_m   INT,
  sombrio         TEXT,                        -- 'pleno_sol','semisombra','sombra'
  geom            GEOMETRY(Polygon, 3116),
  notas           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gcps (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo            TEXT UNIQUE NOT NULL,      -- 'GCP-01'
  rol               TEXT NOT NULL,             -- 'control' | 'verificacion'
  este              NUMERIC NOT NULL,          -- EPSG:3116
  norte             NUMERIC NOT NULL,
  altura_m          NUMERIC NOT NULL,
  datum_vertical    TEXT DEFAULT 'local_arbitrario',
  metodo_medicion   TEXT,                      -- 'rtk','garmin_3sesiones'
  sesiones_medicion INT,
  dispersion_h_m    NUMERIC,
  fecha_medida      DATE,
  congelado         BOOLEAN DEFAULT TRUE,
  tipo_monumento    TEXT,                      -- 'concreto','panel_removible'
  tipo_objetivo     TEXT,                      -- 'damero_pintado','codificado_metashape'
  codigo_metashape  INT,
  tamano_cm         INT,
  estado_fisico     TEXT DEFAULT 'bueno',      -- 'bueno','deteriorado','destruido'
  fecha_repintado   DATE,
  geom              GEOMETRY(Point, 3116),
  notas             TEXT
);

CREATE TABLE gcp_distancias (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gcp_a       UUID NOT NULL REFERENCES gcps(id),
  gcp_b       UUID NOT NULL REFERENCES gcps(id),
  distancia_m NUMERIC NOT NULL,
  metodo      TEXT,                            -- 'laser','cinta'
  precision_m NUMERIC,
  fecha       DATE,
  UNIQUE(gcp_a, gcp_b)
);
```

## 29. Plantas

```sql
CREATE TABLE plantas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id           UUID NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  id_planta         TEXT NOT NULL,             -- 'PAP-04-12'
  surco             INT,
  posicion          INT,
  lat               DOUBLE PRECISION,
  lon               DOUBLE PRECISION,
  geom              GEOMETRY(Point, 3116),
  fuente_coord      TEXT,                      -- 'gnss','dron_deteccion','manual'
  precision_coord_m NUMERIC,
  fecha_siembra     DATE,
  variedad          TEXT,
  es_submuestra     BOOLEAN DEFAULT FALSE,
  franja_topografica TEXT,                     -- 'alta','media','baja'
  estado_actual     TEXT DEFAULT 'viva_sana',
  fecha_muerte      DATE,
  causa_muerte      TEXT,
  planta_reemplaza  UUID REFERENCES plantas(id),
  activa            BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lote_id, id_planta)
);

CREATE INDEX idx_plantas_geom       ON plantas USING GIST(geom);
CREATE INDEX idx_plantas_lote       ON plantas(lote_id);
CREATE INDEX idx_plantas_submuestra ON plantas(es_submuestra) WHERE es_submuestra;
```

## 30. Observaciones de campo (Nivel 1)

```sql
CREATE TABLE observaciones (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planta_id             UUID NOT NULL REFERENCES plantas(id) ON DELETE CASCADE,
  fecha                 DATE NOT NULL,
  tipo                  TEXT DEFAULT 'submuestra_mensual',
                        -- 'submuestra_mensual' | 'diagnostico_dirigido'
  observador            TEXT,

  -- Crecimiento
  altura_cm             NUMERIC,
  diametro_tallo_mm     NUMERIC,
  diametro_copa_ns_cm   NUMERIC,
  diametro_copa_eo_cm   NUMERIC,
  num_cruces            INT,
  num_ramas_prod        INT,

  -- Sanidad
  estado                TEXT NOT NULL,
  vigor                 INT CHECK (vigor BETWEEN 1 AND 5),
  clorosis_pct          INT CHECK (clorosis_pct BETWEEN 0 AND 100),
  defoliacion_pct       INT CHECK (defoliacion_pct BETWEEN 0 AND 100),
  roya_severidad        INT CHECK (roya_severidad BETWEEN 0 AND 4),
  ojo_gallo_severidad   INT CHECK (ojo_gallo_severidad BETWEEN 0 AND 4),
  minador_severidad     INT CHECK (minador_severidad BETWEEN 0 AND 4),
  broca_pct             NUMERIC,
  llaga_macana          BOOLEAN DEFAULT FALSE,
  deficiencia_nutric    TEXT,

  foto_url              TEXT,
  notas                 TEXT,
  gps_lat               DOUBLE PRECISION,
  gps_lon               DOUBLE PRECISION,
  gps_precision_m       NUMERIC,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(planta_id, fecha)
);

CREATE INDEX idx_obs_planta_fecha ON observaciones(planta_id, fecha DESC);
CREATE INDEX idx_obs_fecha        ON observaciones(fecha);
```

## 31. Barrido censal (Nivel 2)

```sql
CREATE TABLE barridos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id           UUID NOT NULL REFERENCES lotes(id),
  fecha             DATE NOT NULL,
  observadores      TEXT,
  duracion_min      INT,
  plantas_revisadas INT,
  notas             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE barrido_registros (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barrido_id         UUID NOT NULL REFERENCES barridos(id) ON DELETE CASCADE,
  planta_id          UUID REFERENCES plantas(id),
  surco              INT,
  posicion           INT,
  ausente            BOOLEAN DEFAULT FALSE,
  roya               BOOLEAN DEFAULT FALSE,
  ojo_gallo          BOOLEAN DEFAULT FALSE,
  marchitez_tallo    BOOLEAN DEFAULT FALSE,
  defoliacion_severa BOOLEAN DEFAULT FALSE,
  clorosis           BOOLEAN DEFAULT FALSE,
  foto_url           TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_barrido_reg ON barrido_registros(barrido_id);
```

## 32. Vuelos y productos de dron

```sql
CREATE TABLE vuelos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo              TEXT UNIQUE NOT NULL,   -- '20260401_MAVIC3C_CENSO'
  fecha               DATE NOT NULL,
  hora_inicio         TIME,
  hora_fin            TIME,
  plataforma          TEXT NOT NULL,          -- 'mavic3c','mini4pro'
  tipo                TEXT NOT NULL,          -- 'censo','detalle','extraordinario'
  altura_agl_m        NUMERIC,
  gsd_cm              NUMERIC,
  traslape_frontal    INT,
  traslape_lateral    INT,
  velocidad_ms        NUMERIC,
  orientacion_lineas  TEXT,                   -- 'paralela_curvas','otra'
  vuelo_cruzado       BOOLEAN,
  num_fotos           INT,
  condicion_cielo     TEXT,
  viento_ms           NUMERIC,
  iso                 INT,
  obturacion          TEXT,
  wb_fijo             BOOLEAN,

  -- Calidad
  gcps_detectados     INT,
  rmse_control_h_cm   NUMERIC,
  rmse_control_v_cm   NUMERIC,
  rmse_check_h_cm     NUMERIC,                -- ERROR REAL
  rmse_check_v_cm     NUMERIC,
  error_repro_px      NUMERIC,
  fotos_alineadas_pct NUMERIC,
  aprobado            BOOLEAN,
  motivo_rechazo      TEXT,

  -- Productos
  ruta_ortho          TEXT,
  ruta_dsm            TEXT,
  ruta_dtm            TEXT,
  ruta_chm            TEXT,
  ruta_reporte        TEXT,

  notas               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE detecciones (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vuelo_id              UUID NOT NULL REFERENCES vuelos(id) ON DELETE CASCADE,
  planta_id             UUID REFERENCES plantas(id),
  lote_id               UUID REFERENCES lotes(id),
  este                  NUMERIC,
  norte                 NUMERIC,
  geom                  GEOMETRY(Point, 3116),

  -- Métricas GEOMÉTRICAS
  chm_p95_m             NUMERIC,
  chm_media_m           NUMERIC,
  area_copa_m2          NUMERIC,
  diametro_copa_m       NUMERIC,
  volumen_copa_m3       NUMERIC,
  surco                 INT,
  posicion_en_surco     INT,
  dist_vecino_m         NUMERIC,

  -- Diagnóstico de segmentación (NO agronómico)
  exg_media             NUMERIC,

  metodo                TEXT,                 -- 'umbral','yolo','sam_manual'
  confianza             NUMERIC,
  dist_emparejamiento_m NUMERIC,
  es_nueva              BOOLEAN DEFAULT FALSE,
  verificada_campo      BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN detecciones.exg_media IS
  'Operador de segmentación. NO interpretar como indicador de vigor.';

CREATE INDEX idx_det_vuelo  ON detecciones(vuelo_id);
CREATE INDEX idx_det_planta ON detecciones(planta_id);
CREATE INDEX idx_det_geom   ON detecciones USING GIST(geom);

CREATE TABLE productos_terreno (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vuelo_id               UUID NOT NULL REFERENCES vuelos(id),
  lote_id                UUID REFERENCES lotes(id),
  pendiente_media        NUMERIC,
  pendiente_max          NUMERIC,
  aspecto_dominante      TEXT,
  cobertura_dosel_pct    NUMERIC,
  suelo_expuesto_pct     NUMERIC,
  sombra_pct             NUMERIC,
  num_arboles_sombra     INT,
  altura_media_sombrio_m NUMERIC,
  ruta_pendiente         TEXT,
  ruta_aspecto           TEXT,
  ruta_twi               TEXT,
  ruta_insolacion        TEXT,
  created_at             TIMESTAMPTZ DEFAULT NOW()
);
```

## 33. Laboratorio, manejo y alertas

```sql
CREATE TABLE analisis_laboratorio (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id         UUID NOT NULL REFERENCES lotes(id),
  fecha_muestreo  DATE NOT NULL,
  fecha_resultado DATE,
  tipo            TEXT NOT NULL,   -- 'suelo','foliar','fitopatologico'
  laboratorio     TEXT,
  resultados      JSONB,           -- estructura flexible por tipo
  interpretacion  TEXT,
  ruta_informe    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE manejo (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id      UUID NOT NULL REFERENCES lotes(id),
  fecha        DATE NOT NULL,
  tipo         TEXT NOT NULL,   -- 'fertilizacion','control_arvenses','poda',
                                -- 'control_fitosanitario','resiembra','regulacion_sombra'
  producto     TEXT,
  dosis        TEXT,
  area_m2      NUMERIC,
  costo_cop    NUMERIC,
  responsable  TEXT,
  notas        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alertas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planta_id       UUID REFERENCES plantas(id),
  lote_id         UUID REFERENCES lotes(id),
  tipo            TEXT NOT NULL,
  severidad       TEXT NOT NULL,   -- 'baja','media','alta','critica'
  origen          TEXT NOT NULL,   -- 'dron','barrido','submuestra','sistema'
  vuelo_id        UUID REFERENCES vuelos(id),
  barrido_id      UUID REFERENCES barridos(id),
  descripcion     TEXT,
  fecha_deteccion DATE NOT NULL,
  estado          TEXT DEFAULT 'abierta',
                  -- 'abierta','en_verificacion','confirmada','descartada','resuelta'
  fecha_cierre    DATE,
  resolucion      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alertas_abiertas ON alertas(estado) WHERE estado = 'abierta';
```

## 34. Vistas analíticas

```sql
-- Estado actual por planta
CREATE VIEW v_estado_actual AS
SELECT DISTINCT ON (o.planta_id)
  p.id_planta, l.codigo AS lote, p.es_submuestra, p.franja_topografica,
  o.fecha, o.altura_cm, o.diametro_tallo_mm, o.num_cruces,
  o.estado, o.vigor, o.roya_severidad, o.ojo_gallo_severidad
FROM observaciones o
JOIN plantas p ON p.id = o.planta_id
JOIN lotes   l ON l.id = p.lote_id
WHERE p.activa
ORDER BY o.planta_id, o.fecha DESC;

-- Tasa de crecimiento
CREATE VIEW v_crecimiento AS
SELECT
  planta_id, fecha, altura_cm,
  altura_cm - LAG(altura_cm) OVER w AS delta_altura_cm,
  EXTRACT(DAY FROM fecha - LAG(fecha) OVER w) AS dias,
  ROUND((altura_cm - LAG(altura_cm) OVER w)
        / NULLIF(EXTRACT(DAY FROM fecha - LAG(fecha) OVER w), 0) * 30, 2) AS tasa_cm_mes
FROM observaciones
WHERE altura_cm IS NOT NULL
WINDOW w AS (PARTITION BY planta_id ORDER BY fecha);

-- Mortalidad por lote
CREATE VIEW v_mortalidad AS
SELECT
  l.codigo AS lote,
  COUNT(*) FILTER (WHERE p.activa)                       AS vivas,
  COUNT(*) FILTER (WHERE p.estado_actual = 'muerta')     AS muertas,
  COUNT(*) FILTER (WHERE p.planta_reemplaza IS NOT NULL) AS resembradas,
  COUNT(*)                                               AS total_historico,
  ROUND(100.0 * COUNT(*) FILTER (WHERE p.estado_actual = 'muerta')
        / NULLIF(COUNT(*), 0), 2)                        AS mortalidad_pct
FROM plantas p JOIN lotes l ON l.id = p.lote_id
GROUP BY l.codigo;

-- Incidencia censal del último barrido
CREATE VIEW v_incidencia_censal AS
SELECT
  l.codigo AS lote, b.fecha,
  COUNT(*) AS revisadas,
  ROUND(100.0*COUNT(*) FILTER (WHERE br.roya)/COUNT(*), 2)               AS roya_pct,
  ROUND(100.0*COUNT(*) FILTER (WHERE br.ojo_gallo)/COUNT(*), 2)          AS ojo_gallo_pct,
  ROUND(100.0*COUNT(*) FILTER (WHERE br.ausente)/COUNT(*), 2)            AS ausentes_pct,
  ROUND(100.0*COUNT(*) FILTER (WHERE br.defoliacion_severa)/COUNT(*), 2) AS defoliacion_pct,
  COUNT(*) FILTER (WHERE br.marchitez_tallo)                             AS casos_marchitez
FROM barrido_registros br
JOIN barridos b ON b.id = br.barrido_id
JOIN lotes    l ON l.id = b.lote_id
GROUP BY l.codigo, b.fecha;
```

---

# PARTE VIII — ALERTAS Y PLATAFORMA

## 35. Reglas de alerta

```
── DRON (geométricas) ──────────────────────────────────────
mortalidad_candidata   detectada en t1, ausente en t2
crecimiento_detenido   ΔCHM_p95 < 5 cm en 3 meses
perdida_copa           Δárea_copa < −20 %
planta_nueva           detección sin planta asociada en 60 cm
gap_no_resembrado      posición vacía en dos vuelos consecutivos
cierre_dosel           cobertura > 80 % → conteo individual dejará de ser fiable
sombra_excesiva        sombra_pct > 50 %
sombra_insuficiente    sombra_pct < 20 %

── TERRESTRE (sanitarias) ──────────────────────────────────
foco_roya              ≥3 plantas con roya en radio de 10 m (barrido)
foco_ojo_gallo         ≥3 plantas con ojo de gallo en radio de 10 m
llaga_macana           cualquier marchitez_tallo → CRÍTICA inmediata
vigor_bajo_sostenido   vigor ≤2 en dos observaciones consecutivas
mortalidad_confirmada  estado = 'muerta' en observación de campo
incidencia_creciente   incidencia censal sube >5 pp entre barridos

── SISTEMA ─────────────────────────────────────────────────
sin_medicion           planta de submuestra sin observación en >45 días
barrido_vencido        >100 días desde el último barrido censal
vuelo_vencido          >100 días desde el último vuelo aprobado
red_gcp_degradada      ≥1 monumento 'deteriorado' o 'destruido'
coregistro_fallido     desplazamiento sistemático >3 cm entre épocas
analisis_vencido       >400 días desde el último análisis de suelos
```

## 36. Arquitectura de la plataforma

```
┌─ CAPTURA ─────────────────────────────────────────────┐
│  PWA offline-first (Coffee Monitor)                   │
│  · Formulario de submuestra (Nivel 1)                 │
│  · Interfaz de barrido rápido (Nivel 2)               │
│  · Escaneo QR → ficha de planta                       │
│  · Cámara con guía de encuadre                        │
│  · GPS con precisión reportada                        │
│  · Cola de sincronización (IndexedDB)                 │
└───────────────────────────────────────────────────────┘
                          │
┌─ PROCESAMIENTO ───────────────────────────────────────┐
│  Pipeline Python local (MacBook M3 / ASUS TUF)        │
│  · Metashape → ortho, DSM, DTM                        │
│  · CHM, segmentación, detección                       │
│  · Derivados de terreno (pendiente, TWI, sombra)      │
│  · Emparejamiento espacial                            │
│  · Carga a Supabase                                   │
└───────────────────────────────────────────────────────┘
                          │
┌─ ALMACENAMIENTO ──────────────────────────────────────┐
│  Supabase — PostgreSQL + PostGIS + Storage            │
└───────────────────────────────────────────────────────┘
                          │
┌─ VISUALIZACIÓN ───────────────────────────────────────┐
│  Next.js + Leaflet (extiende mi-visor-gis)            │
└───────────────────────────────────────────────────────┘
```

## 37. Pantallas

### A. Mapa operativo

Capas: ortomosaico por fecha · CHM · pendiente · aspecto · TWI · cobertura · sombra · límites de lote · plantas · faltantes · **focos sanitarios (mapa de calor)** · red GCP · alertas.

Simbología conmutable de plantas: estado · vigor · altura · ΔCHM · edad · condición del último barrido.

Modo comparación: swipe entre ortofoto t1 y t2.

Configuración Leaflet: panes raster 380 · polígonos 450 · puntos 500 · `circleMarker` con `bubblingMouseEvents: false`.

### B. Ficha de planta

Encabezado (ID, lote, variedad, edad, estado) · gráfica de altura con dos series (medida a pie y estimada por CHM) · gráfica de diámetro de tallo · tira de fotos cronológica · tabla de observaciones · registros de barrido · historial de alertas · botón de nueva observación.

### C. Captura de submuestra (móvil)

Lista de pendientes del mes · campos numéricos con teclado numérico · escalas 0–4 como botones grandes · captura de foto con overlay de encuadre · indicador de sincronización.

**Debe funcionar sin señal.** En el cafetal de Támesis no hay cobertura confiable.

### D. Captura de barrido (móvil)

Vista de surco con lista vertical de posiciones · un toque por condición · avance automático · contador de progreso · botón grande de "ausente".

**Requisito duro: menos de 2 segundos por planta.**

### E. Bandeja de alertas

Lista por severidad y antigüedad · mapa mini por alerta · acciones (verificar, confirmar, descartar, resolver) · **generación de ruta de inspección exportable a GPX**.

### F. Registro de vuelos

Checklist §15 como formulario · carga de productos · visualización de RMSE en control y en check points por separado · semáforo de aprobación · botón para ejecutar el pipeline de detección.

### G. Red geodésica

Mapa de los 9 monumentos por rol y estado · ficha por monumento (coordenadas congeladas, foto, historial) · tabla de distancias medidas · serie histórica de RMSE · alerta si algún monumento no fue detectado.

### H. Dashboard

**Bloque dron — geométrico**
Plantas detectadas / esperadas · cobertura de dosel % y tendencia · altura media (p95 CHM) por lote · **sombra % por lote** · faltantes sin resembrar · RMSE del último vuelo en check points.

**Bloque terrestre — sanitario y de crecimiento**
Mortalidad acumulada % · tasa de crecimiento cm/mes por lote · **incidencia censal de roya %** · **incidencia censal de ojo de gallo %** · vigor medio · focos activos · días desde el último barrido.

> Mantener los dos bloques visualmente separados. Refuerza que provienen de fuentes distintas con alcances distintos.

---

# PARTE IX — CALIDAD

## 38. Validaciones automáticas en ingesta

| Regla | Acción |
|---|---|
| `altura_cm` cae >10 cm respecto al mes anterior | Revisar — error de digitación o poda no registrada |
| `diametro_tallo_mm` decrece | **Rechazar** — el tallo no encoge |
| Planta fuera del polígono de su lote (>2 m) | Marcar coordenada como sospechosa |
| Dos plantas a menos de 30 cm | Posible duplicado |
| `gps_precision_m` > 10 | Aceptar observación, descartar coordenada |
| Fecha futura | Rechazar |
| Planta `muerta` con observación posterior de vigor >2 | Conflicto, revisar |
| Barrido con <90 % de las plantas esperadas | Marcar como incompleto |
| Vuelo con RMSE en check points >5 cm | `aprobado = FALSE` |

## 39. Métricas de calidad del sistema

Reportar trimestralmente:

| Métrica | Objetivo |
|---|---|
| RMSE en check points (horizontal) | < 3 cm |
| RMSE en check points (vertical) | < 5 cm |
| R² de calibración CHM ↔ altura de campo | > 0.75 |
| Precisión de detección (VP / detecciones) | > 90 % |
| Exhaustividad (plantas detectadas / reales) | > 90 % |
| Completitud de la submuestra | > 95 % |
| Cobertura del barrido censal | > 98 % |
| Latencia de alertas (detección → verificación) | < 15 días |
| Monumentos en estado 'bueno' | 9 de 9 |

## 40. Calendario integrado

| Mes | Dron | Terrestre | Laboratorio |
|---|---|---|---|
| Ene | Vuelo censo | Submuestra + barrido censal | — |
| Feb | — | Submuestra | — |
| Mar | — | Submuestra | — |
| Abr | Censo + detalle | Submuestra + barrido censal | Foliar |
| May | — | Submuestra | — |
| Jun | — | Submuestra | — |
| Jul | Vuelo censo | Submuestra + barrido censal | Suelos |
| Ago | — | Submuestra | — |
| Sep | — | Submuestra | — |
| Oct | Censo + detalle | Submuestra + barrido censal | Foliar |
| Nov | — | Submuestra | — |
| Dic | — | Submuestra | — |

**Regla de pareo:** vuelo y medición de submuestra del mismo mes deben ocurrir con **menos de 7 días de diferencia**, para que los datos sean pareables en la calibración del CHM.

## 41. Cronograma de implementación

| Fase | Actividades | Duración |
|---|---|---|
| **0 — Red geodésica** | Construir 9 monumentos · medir coordenadas (RTK o 3 sesiones Garmin) · medir 15 distancias con láser · nivelación local · pintar o instalar objetivos | 2 semanas |
| **1 — Submuestra** | Definir estratificación con DTM preliminar · marcar 195 plantas con QR · levantar coordenadas | 1 semana |
| **2 — Línea base** | Vuelo censo T0 · Metashape · CHM · derivados de terreno · detección por umbral · primera medición de submuestra · primer barrido censal | 3 semanas |
| **3 — Plataforma** | Migrar esquema · PWA de submuestra · PWA de barrido · visor con selector temporal · ficha de planta · dashboard | 4 semanas |
| **4 — Calibración** | Segunda y tercera medición mensual · regresión CHM↔altura · ajuste de umbrales de alerta · validación de detección contra barrido | 8 semanas |
| **5 — Operación** | Ciclo trimestral estable · alertas automáticas · reportes | Continuo |
| **6 — IA (opcional)** | Solo si la detección por umbral queda bajo 85 %: anotación SAM · entrenamiento YOLO | 4 semanas |

---

# PARTE X — REPORTES

## 42. Matriz de trazabilidad

| Métrica | Fuente | Método | Incertidumbre |
|---|---|---|---|
| Área del lote | Dron | Polígono sobre ortomosaico | ±2 % |
| Número de plantas | Dron + barrido | Detección verificada | ±3 % |
| Densidad (pl/ha) | Derivada | Conteo / área | ±4 % |
| Altura media | Dron calibrado | CHM p95 + regresión | ±10 cm |
| Cobertura de dosel | Dron | Segmentación ExG + CHM | ±3 % |
| Porcentaje de sombra | Dron | CHM > 3 m / área | ±5 % |
| Pendiente, aspecto, TWI | Dron | DTM fotogramétrico | ±3° |
| Tasa de crecimiento | Terrestre | Submuestra 8 %, extrapolada | IC 95 % |
| Mortalidad | Terrestre | Barrido censal | ±1 % |
| Incidencia de roya | Terrestre | Barrido censal | ±2 % |
| Incidencia de ojo de gallo | Terrestre | Barrido censal | ±2 % |
| Vigor | Terrestre | Escala visual, submuestra | Ordinal, subjetiva |
| Estado nutricional | Laboratorio | Análisis foliar | Según laboratorio |

## 43. Declaración estándar para reportes

> Los productos derivados del dron corresponden a mediciones geométricas y de inventario sobre imagen RGB georreferenciada, con red de control terrestre de nueve monumentos permanentes y verificación independiente en dos puntos de chequeo. La evaluación del estado sanitario y fisiológico del cultivo se realiza exclusivamente mediante inspección terrestre directa: barrido censal trimestral sobre el 100 % de las plantas y submuestra permanente mensual del 8 %. No se emplean índices de vegetación RGB como indicadores de estado fisiológico, dado que las plataformas utilizadas carecen de banda infrarroja cercana; dichos índices se usan únicamente como operador de segmentación para separar vegetación de suelo. La precisión posicional absoluta es de aproximadamente ±1.5 m; la precisión relativa entre épocas es de orden centimétrico gracias al co-registro sobre coordenadas de control congeladas.

## 44. Limitaciones a declarar

1. La altura estimada por CHM tiene error de 5–15 cm y solo es válida mientras el suelo entre surcos sea visible.
2. El conteo automático degrada al cerrarse el dosel (>80 % de cobertura); a partir de ahí se reportan métricas por franja, no individuales.
3. La mortalidad detectada por dron es candidata, no confirmada. Solo el barrido censal confirma.
4. Las tasas de crecimiento se derivan de una submuestra del 8 % extrapolada mediante calibración CHM. Reportar intervalos de confianza, no valores puntuales.
5. Las escalas de severidad sanitaria son ordinales y dependen del observador. Mantener el mismo evaluador entre épocas reduce, pero no elimina, la variabilidad.
6. El datum vertical es local y arbitrario; las alturas no son ortométricas.

---

# ANEXOS

## Anexo A — Materiales para la red geodésica

| Ítem | Cantidad | Nota |
|---|---|---|
| Cemento gris | 2 bultos | 9 monumentos |
| Arena y gravilla | 0.3 m³ | |
| Varilla 3/8" | 5 m | Cortar en 9 tramos de 50 cm |
| Panel PVC espumado 3 mm | 9 × (60×60 cm) | Si eliges opción B |
| Pintura mate negra exterior | 1 galón | |
| Pintura mate gris claro exterior | 1 galón | RGB ≈ 220 |
| Plantilla de damero | 1 | Cartón o MDF, 60×60 cm |
| Distanciómetro láser 30 m+ | 1 | ~COP 250.000 |
| Trípode para receptor GNSS | 1 | |
| Alquiler receptor RTK | 1 día | COP 150.000–300.000 |
| Marcador de grabado | 1 | Códigos en concreto fresco |

**Costo total estimado: COP 700.000–1.100.000**, una sola vez, vida útil >10 años.

## Anexo B — Materiales para la submuestra

| Ítem | Cantidad |
|---|---|
| Etiquetas de aluminio o plástico UV con QR | 220 (195 + repuestos) |
| Hilo o cinta de amarre no metálica | 1 rollo |
| Calibrador digital 0.1 mm | 1 |
| Vara graduada 3 m | 1 |
| Cinta métrica 1.5 m | 2 |
| Pintura blanca para marca de tallo | 1 tarro pequeño |
| Estacas para posición de fotografía | 195 |
| Alcohol 70 % | 1 L |

## Anexo C — Ruta de mejora

| Mejora | Beneficio | Costo aproximado | Prioridad |
|---|---|---|---|
| **Estación meteorológica en sitio** | Correlación clima ↔ crecimiento ↔ brotes. Sin ella no puedes explicar por qué el crecimiento varió entre trimestres | USD 300–800 | **1** |
| GNSS RTK propio (Emlid Reach) | Elimina dependencia de alquiler, permite re-densificar la red | USD 800–1500 | 2 |
| Cámara RGN modificada (Mapir Survey3) | NDVI real, detección temprana de estrés | USD 400–900 | 3 |
| Sensores de humedad de suelo | Estrés hídrico real | USD 200–500 | 4 |
| Sensor multiespectral | NDRE, índices de nitrógeno | USD 4000+ | 5 |

**La estación meteorológica es la de mejor relación costo/beneficio del listado.** Toda serie de crecimiento sin datos de clima concurrentes es una serie que no puedes explicar.
