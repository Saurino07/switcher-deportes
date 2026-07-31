# V14.4 — estabilidad de cámara y marcador profesional

- El canvas conserva el último fotograma válido y ya no se limpia a negro cuando Android entrega un fotograma incompleto.
- Render limitado a ~24 FPS y resolución de canvas 1x para reducir carga térmica y parpadeo.
- Se eliminan animaciones y efectos GPU costosos del marcador al estar embebido.
- Marcador escalado dinámicamente a aproximadamente 38% del ancho de la pantalla, con máximo de 520 px.
- Se conserva el resto de funciones de V14.2.
