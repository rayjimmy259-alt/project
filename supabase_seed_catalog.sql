-- ComparaTech product catalog for Supabase SQL Editor.
-- Safe to rerun: deterministic UUIDs and image/category upserts.
--
-- The products are real commercial models. Prices and KiScore values are indicative
-- seed estimates, not live quotes or independent benchmark results. Replace prices
-- and retailer search URLs with verified offers / affiliate URLs before monetizing.
-- Each product has a distinct high-resolution Unsplash image representative of its device category.
--
-- Expected schema:
--   categories(id, name, slug)
--   brands(id, name, slug)
--   stores(id, name, logo_url)
--   products(id, name, slug, brand_id, category_id, description, image_url)
--   product_offers(id, product_id, store_id, price, currency, affiliate_url, in_stock)
--   product_specs(id, product_id, spec_key, spec_value)
--   product_reviews(id, product_id, user_name, rating, comment, created_at)
-- This script adds products.quality_price_score if it is not already present.

begin;

alter table products
  add column if not exists quality_price_score numeric(3, 1);

create table if not exists product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_name text not null check (char_length(btrim(user_name)) between 2 and 60),
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null check (char_length(btrim(comment)) between 10 and 1000),
  created_at timestamptz not null default now()
);

alter table product_reviews enable row level security;

grant select, insert on product_reviews to anon, authenticated;

drop policy if exists "Anyone can read product reviews" on product_reviews;
create policy "Anyone can read product reviews"
  on product_reviews for select
  to anon, authenticated
  using (true);

drop policy if exists "Visitors can add valid product reviews" on product_reviews;
create policy "Visitors can add valid product reviews"
  on product_reviews for insert
  to anon, authenticated
  with check (
    char_length(btrim(user_name)) between 2 and 60
    and rating between 1 and 5
    and char_length(btrim(comment)) between 10 and 1000
  );

create temp table _techcompare_seed_products (
  slug text primary key,
  name text not null,
  brand text not null,
  category_slug text not null,
  description text not null,
  price numeric(12, 2) not null check (price > 0),
  quality_price_score numeric(3, 1) not null check (quality_price_score between 0 and 10),
  specs text[] not null
) on commit drop;

insert into _techcompare_seed_products
  (slug, name, brand, category_slug, description, price, quality_price_score, specs)
values
  -- Audio & Auriculares (25)
  ('apple-airpods-pro-2', 'Apple AirPods Pro (2.ª generación)', 'Apple', 'audio-auriculares', 'Audífonos TWS con cancelación activa de ruido y estuche MagSafe USB-C.', 249, 8.8, array['Tipo|TWS in-ear', 'Conectividad|Bluetooth 5.3', 'Característica|ANC y modo ambiente']),
  ('apple-airpods-4-anc', 'Apple AirPods 4 con cancelación activa de ruido', 'Apple', 'audio-auriculares', 'Audífonos TWS abiertos con audio espacial y cancelación activa de ruido.', 179, 8.6, array['Tipo|TWS open-ear', 'Conectividad|Bluetooth 5.3', 'Característica|ANC y audio espacial']),
  ('apple-airpods-4', 'Apple AirPods 4', 'Apple', 'audio-auriculares', 'Audífonos TWS de ajuste abierto con estuche USB-C.', 129, 8.7, array['Tipo|TWS open-ear', 'Conectividad|Bluetooth 5.3', 'Característica|Audio espacial personalizado']),
  ('sony-wf-1000xm5', 'Sony WF-1000XM5', 'Sony', 'audio-auriculares', 'Audífonos TWS premium con cancelación de ruido y audio de alta resolución.', 299, 8.6, array['Tipo|TWS in-ear', 'Conectividad|Bluetooth 5.3', 'Característica|ANC y LDAC']),
  ('sony-wh-1000xm5', 'Sony WH-1000XM5', 'Sony', 'audio-auriculares', 'Audífonos over-ear inalámbricos con cancelación de ruido adaptativa.', 399, 8.4, array['Tipo|Over-ear inalámbrico', 'Conectividad|Bluetooth 5.2 y USB-C', 'Característica|ANC y autonomía hasta 30 h']),
  ('sony-wh-ch720n', 'Sony WH-CH720N', 'Sony', 'audio-auriculares', 'Audífonos over-ear ligeros con cancelación activa de ruido.', 149, 9.0, array['Tipo|Over-ear inalámbrico', 'Conectividad|Bluetooth 5.2', 'Característica|ANC y autonomía hasta 35 h']),
  ('bose-quietcomfort-ultra-headphones', 'Bose QuietComfort Ultra Headphones', 'Bose', 'audio-auriculares', 'Audífonos over-ear con cancelación de ruido y audio inmersivo.', 429, 8.2, array['Tipo|Over-ear inalámbrico', 'Conectividad|Bluetooth 5.3', 'Característica|ANC y audio espacial']),
  ('bose-quietcomfort-headphones', 'Bose QuietComfort Headphones', 'Bose', 'audio-auriculares', 'Audífonos inalámbricos cómodos con cancelación de ruido.', 349, 8.5, array['Tipo|Over-ear inalámbrico', 'Conectividad|Bluetooth 5.1', 'Característica|ANC y autonomía hasta 24 h']),
  ('sennheiser-momentum-4-wireless', 'Sennheiser MOMENTUM 4 Wireless', 'Sennheiser', 'audio-auriculares', 'Audífonos over-ear con sonido de alta fidelidad y larga autonomía.', 349, 9.0, array['Tipo|Over-ear inalámbrico', 'Conectividad|Bluetooth 5.2 y aptX Adaptive', 'Característica|Autonomía hasta 60 h']),
  ('sennheiser-momentum-true-wireless-4', 'Sennheiser MOMENTUM True Wireless 4', 'Sennheiser', 'audio-auriculares', 'Audífonos TWS premium con sonido aptX Lossless y ANC adaptativa.', 299, 8.3, array['Tipo|TWS in-ear', 'Conectividad|Bluetooth 5.4', 'Característica|ANC adaptativa y aptX Lossless']),
  ('jbl-tour-pro-2', 'JBL Tour Pro 2', 'JBL', 'audio-auriculares', 'Audífonos TWS con cancelación de ruido y estuche inteligente con pantalla.', 249, 8.3, array['Tipo|TWS in-ear', 'Conectividad|Bluetooth 5.3', 'Característica|ANC y estuche Smart Charging Case']),
  ('jbl-live-pro-2', 'JBL Live Pro 2 TWS', 'JBL', 'audio-auriculares', 'Audífonos TWS con cancelación adaptativa y resistencia al agua.', 149, 8.8, array['Tipo|TWS in-ear', 'Conectividad|Bluetooth 5.2', 'Característica|ANC adaptativa e IPX5']),
  ('jbl-tune-770nc', 'JBL Tune 770NC', 'JBL', 'audio-auriculares', 'Audífonos over-ear inalámbricos con cancelación adaptativa de ruido.', 129, 9.0, array['Tipo|Over-ear inalámbrico', 'Conectividad|Bluetooth 5.3', 'Característica|ANC adaptativa y autonomía hasta 70 h']),
  ('samsung-galaxy-buds3-pro', 'Samsung Galaxy Buds3 Pro', 'Samsung', 'audio-auriculares', 'Audífonos TWS con audio de alta resolución y cancelación de ruido.', 249, 8.4, array['Tipo|TWS in-ear', 'Conectividad|Bluetooth 5.4', 'Característica|ANC adaptativa e IP57']),
  ('samsung-galaxy-buds-fe', 'Samsung Galaxy Buds FE', 'Samsung', 'audio-auriculares', 'Audífonos TWS compactos con cancelación activa y ajuste con aletas.', 99, 9.2, array['Tipo|TWS in-ear', 'Conectividad|Bluetooth 5.2', 'Característica|ANC e IPX2']),
  ('google-pixel-buds-pro-2', 'Google Pixel Buds Pro 2', 'Google', 'audio-auriculares', 'Audífonos TWS con cancelación de ruido y asistente integrado.', 229, 8.4, array['Tipo|TWS in-ear', 'Conectividad|Bluetooth 5.4', 'Característica|ANC e integración Google']),
  ('nothing-ear-2024', 'Nothing Ear (2024)', 'Nothing', 'audio-auriculares', 'Audífonos TWS con diseño transparente, ANC y ecualizador avanzado.', 149, 9.0, array['Tipo|TWS in-ear', 'Conectividad|Bluetooth 5.3', 'Característica|ANC e IP54']),
  ('anker-soundcore-liberty-4-nc', 'Soundcore Liberty 4 NC', 'Anker', 'audio-auriculares', 'Audífonos TWS con ANC adaptativa y estuche de carga inalámbrica.', 99, 9.4, array['Tipo|TWS in-ear', 'Conectividad|Bluetooth 5.3', 'Característica|ANC adaptativa e IPX4']),
  ('anker-soundcore-space-one', 'Soundcore Space One', 'Anker', 'audio-auriculares', 'Audífonos over-ear económicos con cancelación activa de ruido.', 99, 9.1, array['Tipo|Over-ear inalámbrico', 'Conectividad|Bluetooth 5.3', 'Característica|ANC y autonomía hasta 40 h']),
  ('beats-studio-pro', 'Beats Studio Pro', 'Beats', 'audio-auriculares', 'Audífonos over-ear con ANC, audio espacial y conexión USB-C.', 349, 8.0, array['Tipo|Over-ear inalámbrico', 'Conectividad|Bluetooth y USB-C', 'Característica|ANC y audio espacial']),
  ('beats-fit-pro', 'Beats Fit Pro', 'Beats', 'audio-auriculares', 'Audífonos TWS deportivos con aletas de ajuste y cancelación de ruido.', 199, 8.6, array['Tipo|TWS deportivo', 'Conectividad|Bluetooth 5.0', 'Característica|ANC y resistencia al sudor']),
  ('razer-blackshark-v2-pro-2023', 'Razer BlackShark V2 Pro (2023)', 'Razer', 'audio-auriculares', 'Headset inalámbrico gaming con micrófono desmontable y audio espacial.', 199, 8.5, array['Tipo|Headset gaming over-ear', 'Conectividad|2.4 GHz inalámbrico y Bluetooth', 'Característica|Micrófono desmontable y THX Spatial Audio']),
  ('logitech-g-pro-x-2-lightspeed', 'Logitech G Pro X 2 LIGHTSPEED', 'Logitech', 'audio-auriculares', 'Headset gaming inalámbrico con transductores de grafeno.', 249, 8.1, array['Tipo|Headset gaming over-ear', 'Conectividad|LIGHTSPEED y Bluetooth', 'Característica|Transductores de grafeno']),
  ('hyperx-cloud-iii-wireless', 'HyperX Cloud III Wireless', 'HyperX', 'audio-auriculares', 'Headset gaming inalámbrico con batería de larga duración.', 169, 8.8, array['Tipo|Headset gaming over-ear', 'Conectividad|2.4 GHz inalámbrico', 'Característica|Autonomía hasta 120 h']),
  ('steelseries-arctis-nova-7', 'SteelSeries Arctis Nova 7', 'SteelSeries', 'audio-auriculares', 'Headset gaming inalámbrico con audio simultáneo de 2.4 GHz y Bluetooth.', 179, 8.7, array['Tipo|Headset gaming over-ear', 'Conectividad|2.4 GHz y Bluetooth', 'Característica|Audio simultáneo y ClearCast Gen 2']),

  -- Smartwatches & Wearables (25)
  ('apple-watch-series-10-gps-42', 'Apple Watch Series 10 GPS 42 mm', 'Apple', 'wearables', 'Smartwatch con pantalla Retina, seguimiento de actividad y detección de salud.', 399, 8.5, array['Tipo|Smartwatch', 'Pantalla|OLED LTPO Retina', 'Conectividad|GPS y Bluetooth']),
  ('apple-watch-ultra-2', 'Apple Watch Ultra 2', 'Apple', 'wearables', 'Smartwatch resistente para aventura, deporte y actividades al aire libre.', 799, 8.2, array['Tipo|Smartwatch outdoor', 'Pantalla|OLED LTPO de alto brillo', 'Conectividad|GPS de doble frecuencia y LTE']),
  ('apple-watch-se-2', 'Apple Watch SE (2.ª generación)', 'Apple', 'wearables', 'Smartwatch Apple esencial con seguimiento de actividad y seguridad.', 249, 9.0, array['Tipo|Smartwatch', 'Pantalla|OLED Retina', 'Conectividad|GPS y Bluetooth']),
  ('samsung-galaxy-watch-ultra', 'Samsung Galaxy Watch Ultra', 'Samsung', 'wearables', 'Smartwatch robusto con GPS, métricas deportivas y resistencia al agua.', 649, 8.1, array['Tipo|Smartwatch outdoor', 'Pantalla|Super AMOLED', 'Conectividad|GPS multibanda y LTE']),
  ('samsung-galaxy-watch7-44', 'Samsung Galaxy Watch7 44 mm', 'Samsung', 'wearables', 'Smartwatch con seguimiento de salud, sueño y entrenamiento.', 329, 8.6, array['Tipo|Smartwatch', 'Pantalla|Super AMOLED', 'Conectividad|GPS y Bluetooth']),
  ('samsung-galaxy-fit3', 'Samsung Galaxy Fit3', 'Samsung', 'wearables', 'Banda de actividad ligera con seguimiento de sueño y ejercicios.', 69, 9.2, array['Tipo|Banda fitness', 'Pantalla|AMOLED 1.6 pulgadas', 'Conectividad|Bluetooth 5.3']),
  ('google-pixel-watch-3-45', 'Google Pixel Watch 3 45 mm', 'Google', 'wearables', 'Smartwatch Google con seguimiento Fitbit y pantalla Actua.', 399, 8.3, array['Tipo|Smartwatch', 'Pantalla|Actua AMOLED LTPO', 'Conectividad|GPS y Bluetooth']),
  ('fitbit-charge-6', 'Fitbit Charge 6', 'Fitbit', 'wearables', 'Banda fitness con GPS, métricas de salud y seguimiento del sueño.', 159, 8.8, array['Tipo|Banda fitness', 'Pantalla|AMOLED a color', 'Conectividad|GPS integrado y Bluetooth']),
  ('fitbit-sense-2', 'Fitbit Sense 2', 'Fitbit', 'wearables', 'Smartwatch centrado en salud, estrés, sueño y actividad física.', 249, 8.1, array['Tipo|Smartwatch de salud', 'Pantalla|AMOLED', 'Conectividad|GPS y Bluetooth']),
  ('garmin-forerunner-265', 'Garmin Forerunner 265', 'Garmin', 'wearables', 'Reloj GPS de running con pantalla AMOLED y métricas de entrenamiento.', 449, 8.6, array['Tipo|Reloj deportivo GPS', 'Pantalla|AMOLED', 'Conectividad|GPS multibanda y ANT+']),
  ('garmin-forerunner-165', 'Garmin Forerunner 165', 'Garmin', 'wearables', 'Reloj GPS de running ligero con métricas de entrenamiento y recuperación.', 249, 9.1, array['Tipo|Reloj deportivo GPS', 'Pantalla|AMOLED', 'Conectividad|GPS y Bluetooth']),
  ('garmin-fenix-7-pro', 'Garmin fēnix 7 Pro Solar', 'Garmin', 'wearables', 'Reloj multideporte GPS con carga solar y mapas para actividades outdoor.', 799, 8.0, array['Tipo|Reloj multideporte outdoor', 'Pantalla|MIP transflectiva solar', 'Conectividad|GPS multibanda y ANT+']),
  ('garmin-vivoactive-5', 'Garmin vívoactive 5', 'Garmin', 'wearables', 'Smartwatch deportivo con pantalla AMOLED y perfiles de actividad.', 299, 8.8, array['Tipo|Smartwatch deportivo', 'Pantalla|AMOLED', 'Conectividad|GPS y Bluetooth']),
  ('xiaomi-smart-band-9', 'Xiaomi Smart Band 9', 'Xiaomi', 'wearables', 'Banda fitness con pantalla AMOLED y monitoreo de actividad diaria.', 49, 9.5, array['Tipo|Banda fitness', 'Pantalla|AMOLED 1.62 pulgadas', 'Conectividad|Bluetooth 5.4']),
  ('xiaomi-watch-2', 'Xiaomi Watch 2', 'Xiaomi', 'wearables', 'Smartwatch Wear OS con GPS y seguimiento deportivo.', 199, 8.9, array['Tipo|Smartwatch Wear OS', 'Pantalla|AMOLED 1.43 pulgadas', 'Conectividad|GPS y Bluetooth']),
  ('amazfit-balance', 'Amazfit Balance', 'Amazfit', 'wearables', 'Smartwatch con métricas de salud, GPS y autonomía prolongada.', 229, 9.0, array['Tipo|Smartwatch deportivo', 'Pantalla|AMOLED 1.5 pulgadas', 'Conectividad|GPS multibanda y Bluetooth']),
  ('amazfit-active-2', 'Amazfit Active 2', 'Amazfit', 'wearables', 'Reloj inteligente deportivo con GPS y seguimiento de actividad.', 99, 9.3, array['Tipo|Smartwatch deportivo', 'Pantalla|AMOLED', 'Conectividad|GPS y Bluetooth']),
  ('amazfit-t-rex-3', 'Amazfit T-Rex 3', 'Amazfit', 'wearables', 'Reloj robusto para outdoor con GPS y mapas sin conexión.', 279, 8.8, array['Tipo|Smartwatch outdoor', 'Pantalla|AMOLED', 'Conectividad|GPS multibanda y Bluetooth']),
  ('oneplus-watch-2', 'OnePlus Watch 2', 'OnePlus', 'wearables', 'Smartwatch Wear OS con GPS y arquitectura de doble motor.', 299, 8.5, array['Tipo|Smartwatch Wear OS', 'Pantalla|AMOLED 1.43 pulgadas', 'Conectividad|GPS de doble frecuencia y Bluetooth']),
  ('huawei-watch-gt-5-46', 'Huawei Watch GT 5 46 mm', 'Huawei', 'wearables', 'Smartwatch deportivo con GPS y autonomía extendida.', 249, 8.8, array['Tipo|Smartwatch deportivo', 'Pantalla|AMOLED', 'Conectividad|GPS y Bluetooth']),
  ('huawei-watch-fit-3', 'Huawei Watch Fit 3', 'Huawei', 'wearables', 'Reloj ligero con pantalla AMOLED y seguimiento de entrenamiento.', 149, 9.0, array['Tipo|Smartwatch fitness', 'Pantalla|AMOLED 1.82 pulgadas', 'Conectividad|GPS y Bluetooth']),
  ('polar-ignite-3', 'Polar Ignite 3', 'Polar', 'wearables', 'Reloj fitness con seguimiento de recuperación, sueño y entrenamiento.', 329, 8.0, array['Tipo|Reloj fitness', 'Pantalla|AMOLED', 'Conectividad|GPS y Bluetooth']),
  ('withings-scanwatch-2', 'Withings ScanWatch 2', 'Withings', 'wearables', 'Reloj híbrido con seguimiento de salud y pantalla analógica.', 349, 8.0, array['Tipo|Smartwatch híbrido', 'Pantalla|Analógica y escala de grises', 'Conectividad|Bluetooth Low Energy']),
  ('oura-ring-4', 'Oura Ring 4', 'Oura', 'wearables', 'Anillo inteligente para monitoreo de sueño, actividad y recuperación.', 349, 7.8, array['Tipo|Anillo inteligente', 'Sensores|Frecuencia cardiaca, temperatura y movimiento', 'Conectividad|Bluetooth Low Energy']),
  ('whoop-4-0', 'WHOOP 4.0', 'WHOOP', 'wearables', 'Pulsera de monitoreo de recuperación, sueño y carga de entrenamiento.', 239, 7.8, array['Tipo|Pulsera de actividad', 'Sensores|Frecuencia cardiaca y movimiento', 'Conectividad|Bluetooth Low Energy']),

  -- Periféricos de PC (25)
  ('logitech-mx-keys-s', 'Logitech MX Keys S', 'Logitech', 'perifericos-pc', 'Teclado inalámbrico de perfil bajo con retroiluminación inteligente.', 109, 9.1, array['Tipo|Teclado inalámbrico de perfil bajo', 'Conectividad|Bluetooth y Logi Bolt', 'Característica|Retroiluminación inteligente']),
  ('logitech-g915-x-lightspeed', 'Logitech G915 X LIGHTSPEED', 'Logitech', 'perifericos-pc', 'Teclado gaming mecánico inalámbrico de perfil bajo.', 229, 8.2, array['Tipo|Teclado mecánico low-profile', 'Conectividad|LIGHTSPEED, Bluetooth y USB', 'Característica|RGB LIGHTSYNC']),
  ('logitech-g-pro-x-tkl-rapid', 'Logitech G Pro X TKL RAPID', 'Logitech', 'perifericos-pc', 'Teclado gaming TKL con switches magnéticos analógicos.', 169, 8.4, array['Tipo|Teclado TKL magnético', 'Conectividad|USB-C', 'Característica|Actuación ajustable y Rapid Trigger']),
  ('razer-blackwidow-v4-pro-75', 'Razer BlackWidow V4 Pro 75%', 'Razer', 'perifericos-pc', 'Teclado mecánico inalámbrico compacto con pantalla OLED y RGB.', 299, 8.0, array['Tipo|Teclado mecánico 75%', 'Conectividad|Razer HyperSpeed y Bluetooth', 'Característica|Pantalla OLED y RGB Chroma']),
  ('razer-huntsman-v3-pro-tkl', 'Razer Huntsman V3 Pro TKL', 'Razer', 'perifericos-pc', 'Teclado gaming TKL óptico analógico con Rapid Trigger.', 219, 8.6, array['Tipo|Teclado óptico analógico TKL', 'Conectividad|USB-C', 'Característica|Rapid Trigger y actuación ajustable']),
  ('corsair-k100-rgb', 'Corsair K100 RGB', 'Corsair', 'perifericos-pc', 'Teclado mecánico gaming con rueda iCUE y controles multimedia.', 249, 8.0, array['Tipo|Teclado mecánico full-size', 'Conectividad|USB', 'Característica|RGB por tecla y rueda iCUE']),
  ('corsair-k70-core', 'Corsair K70 CORE', 'Corsair', 'perifericos-pc', 'Teclado mecánico gaming con switches lineales y controles multimedia.', 99, 9.0, array['Tipo|Teclado mecánico full-size', 'Conectividad|USB-C', 'Característica|RGB y rueda multifunción']),
  ('keychron-q1-pro', 'Keychron Q1 Pro', 'Keychron', 'perifericos-pc', 'Teclado mecánico personalizado 75% con carcasa de aluminio.', 199, 8.8, array['Tipo|Teclado mecánico 75%', 'Conectividad|Bluetooth y USB-C', 'Característica|Hot-swap y QMK/VIA']),
  ('keychron-k2-pro', 'Keychron K2 Pro', 'Keychron', 'perifericos-pc', 'Teclado mecánico compacto inalámbrico con soporte QMK/VIA.', 99, 9.1, array['Tipo|Teclado mecánico 75%', 'Conectividad|Bluetooth y USB-C', 'Característica|Hot-swap y QMK/VIA']),
  ('steelseries-apex-pro-tkl-wireless-2023', 'SteelSeries Apex Pro TKL Wireless (2023)', 'SteelSeries', 'perifericos-pc', 'Teclado gaming TKL inalámbrico con switches OmniPoint ajustables.', 249, 8.0, array['Tipo|Teclado magnético TKL', 'Conectividad|2.4 GHz, Bluetooth y USB-C', 'Característica|Actuación ajustable']),
  ('logitech-mx-master-3s', 'Logitech MX Master 3S', 'Logitech', 'perifericos-pc', 'Mouse ergonómico inalámbrico con rueda MagSpeed y sensor de 8000 DPI.', 99, 9.5, array['Tipo|Mouse ergonómico', 'Conectividad|Bluetooth y Logi Bolt', 'Sensor|8000 DPI']),
  ('logitech-mx-anywhere-3s', 'Logitech MX Anywhere 3S', 'Logitech', 'perifericos-pc', 'Mouse compacto inalámbrico con seguimiento sobre múltiples superficies.', 79, 9.0, array['Tipo|Mouse compacto', 'Conectividad|Bluetooth y Logi Bolt', 'Sensor|8000 DPI']),
  ('logitech-g-pro-x-superlight-2', 'Logitech G Pro X Superlight 2', 'Logitech', 'perifericos-pc', 'Mouse gaming inalámbrico ultraligero con sensor HERO 2.', 159, 8.8, array['Tipo|Mouse gaming ultraligero', 'Conectividad|LIGHTSPEED y USB-C', 'Sensor|HERO 2 hasta 32000 DPI']),
  ('logitech-g502-x-plus', 'Logitech G502 X Plus', 'Logitech', 'perifericos-pc', 'Mouse gaming inalámbrico con botones híbridos LIGHTFORCE y RGB.', 159, 8.6, array['Tipo|Mouse gaming ergonómico', 'Conectividad|LIGHTSPEED y USB-C', 'Sensor|HERO 25K']),
  ('razer-deathadder-v3-pro', 'Razer DeathAdder V3 Pro', 'Razer', 'perifericos-pc', 'Mouse gaming ergonómico inalámbrico ultraligero.', 149, 8.9, array['Tipo|Mouse gaming ergonómico', 'Conectividad|HyperSpeed Wireless', 'Sensor|Focus Pro 30K']),
  ('razer-viper-v3-pro', 'Razer Viper V3 Pro', 'Razer', 'perifericos-pc', 'Mouse gaming inalámbrico ultraligero con sensor Focus Pro 35K.', 159, 8.7, array['Tipo|Mouse gaming simétrico', 'Conectividad|HyperSpeed Wireless', 'Sensor|Focus Pro 35K']),
  ('razer-basilisk-v3-pro-35k', 'Razer Basilisk V3 Pro 35K', 'Razer', 'perifericos-pc', 'Mouse gaming inalámbrico ergonómico con rueda HyperScroll.', 159, 8.5, array['Tipo|Mouse gaming ergonómico', 'Conectividad|HyperSpeed, Bluetooth y USB-C', 'Sensor|Focus Pro 35K']),
  ('steelseries-aerox-5-wireless', 'SteelSeries Aerox 5 Wireless', 'SteelSeries', 'perifericos-pc', 'Mouse gaming inalámbrico ligero con protección AquaBarrier.', 139, 8.4, array['Tipo|Mouse gaming ultraligero', 'Conectividad|2.4 GHz y Bluetooth', 'Sensor|TrueMove Air 18000 CPI']),
  ('corsair-dark-core-rgb-pro-se', 'Corsair Dark Core RGB Pro SE', 'Corsair', 'perifericos-pc', 'Mouse gaming inalámbrico con carga Qi y agarres intercambiables.', 99, 8.6, array['Tipo|Mouse gaming ergonómico', 'Conectividad|Slipstream, Bluetooth y USB', 'Sensor|PixArt PAW3392 18000 DPI']),
  ('glorious-model-o-2-wireless', 'Glorious Model O 2 Wireless', 'Glorious', 'perifericos-pc', 'Mouse gaming inalámbrico ligero con sensor BAMF 2.0.', 99, 8.5, array['Tipo|Mouse gaming simétrico', 'Conectividad|2.4 GHz, Bluetooth y USB-C', 'Sensor|BAMF 2.0 hasta 26000 DPI']),
  ('steelseries-qck-heavy-large', 'SteelSeries QcK Heavy Large', 'SteelSeries', 'perifericos-pc', 'Mousepad gaming de tela con base de goma antideslizante.', 29, 9.3, array['Tipo|Mousepad de tela', 'Tamaño|Large 450 × 400 mm', 'Base|Goma antideslizante']),
  ('logitech-g840-xl', 'Logitech G840 XL', 'Logitech', 'perifericos-pc', 'Mousepad gaming extendido para teclado y mouse.', 49, 8.9, array['Tipo|Mousepad extendido', 'Tamaño|XL 900 × 400 mm', 'Superficie|Tela de fricción moderada']),
  ('razer-strider-large', 'Razer Strider Large', 'Razer', 'perifericos-pc', 'Mousepad híbrido suave y resistente al agua.', 29, 9.0, array['Tipo|Mousepad híbrido', 'Tamaño|Large 450 × 400 mm', 'Superficie|Tejido híbrido resistente al agua']),
  ('corsair-mm700-rgb-extended', 'Corsair MM700 RGB Extended', 'Corsair', 'perifericos-pc', 'Mousepad extendido con iluminación RGB periférica y hub USB.', 59, 8.2, array['Tipo|Mousepad RGB extendido', 'Tamaño|930 × 400 mm', 'Conectividad|USB-C y hub USB']),
  ('hyperx-pulsefire-mat-2xl', 'HyperX Pulsefire Mat 2XL', 'HyperX', 'perifericos-pc', 'Mousepad extragrande de tela con costuras antideshilachado.', 39, 9.1, array['Tipo|Mousepad de tela extendido', 'Tamaño|2XL 900 × 420 mm', 'Base|Goma antideslizante']),

  -- Accesorios de Computadora (22)
  ('anker-555-usb-c-hub-8-in-1', 'Anker 555 USB-C Hub (8-in-1)', 'Anker', 'accesorios-computadora', 'Hub USB-C multipuerto con HDMI 4K, Ethernet, lectores y Power Delivery.', 69, 9.1, array['Tipo|Hub USB-C 8 en 1', 'Puertos|HDMI, Ethernet, USB-A, USB-C y SD', 'Energía|Power Delivery passthrough']),
  ('anker-555-usb-c-dock-13-in-1', 'Anker 565 USB-C Hub (11-in-1)', 'Anker', 'accesorios-computadora', 'Hub USB-C de escritorio con múltiples puertos de video, datos y red.', 99, 8.7, array['Tipo|Hub USB-C multipuerto', 'Puertos|HDMI, DisplayPort, Ethernet y USB', 'Energía|Power Delivery passthrough']),
  ('anker-778-thunderbolt-docking-station', 'Anker 778 Thunderbolt Docking Station', 'Anker', 'accesorios-computadora', 'Dock Thunderbolt 4 con múltiples pantallas, red y puertos de alta velocidad.', 379, 8.0, array['Tipo|Dock Thunderbolt 4', 'Puertos|Thunderbolt, HDMI, Ethernet y USB', 'Energía|Hasta 100 W al host']),
  ('caldigit-ts4-thunderbolt-station', 'CalDigit TS4 Thunderbolt Station', 'CalDigit', 'accesorios-computadora', 'Estación Thunderbolt 4 con amplia conectividad para escritorio.', 399, 8.3, array['Tipo|Dock Thunderbolt 4', 'Puertos|18 puertos, SD y Ethernet 2.5 GbE', 'Energía|Hasta 98 W al host']),
  ('belkin-connect-pro-thunderbolt-4-dock', 'Belkin Connect Pro Thunderbolt 4 Dock', 'Belkin', 'accesorios-computadora', 'Dock Thunderbolt 4 para conectar pantallas, periféricos y red.', 399, 7.9, array['Tipo|Dock Thunderbolt 4', 'Puertos|Thunderbolt, USB-A, Ethernet y audio', 'Energía|Hasta 90 W al host']),
  ('ugreen-revodok-pro-109', 'UGREEN Revodok Pro 109 USB-C Dock', 'UGREEN', 'accesorios-computadora', 'Dock USB-C compacto con salida de video, Ethernet y lector de tarjetas.', 89, 9.0, array['Tipo|Dock USB-C', 'Puertos|HDMI, Ethernet, USB-A y SD', 'Energía|Power Delivery']),
  ('satechi-multiport-8k-v3', 'Satechi 8-in-1 USB-C Multiport Adapter 8K', 'Satechi', 'accesorios-computadora', 'Adaptador USB-C compacto con salida de video de alta resolución.', 99, 8.5, array['Tipo|Adaptador USB-C 8 en 1', 'Puertos|HDMI 8K, USB-A, Ethernet y SD', 'Energía|Power Delivery passthrough']),
  ('wavlink-thunderbolt-4-dock', 'WAVLINK Thunderbolt 4 Docking Station', 'WAVLINK', 'accesorios-computadora', 'Dock Thunderbolt para ampliar conectividad de laptop y escritorio.', 249, 8.2, array['Tipo|Dock Thunderbolt 4', 'Puertos|Thunderbolt, USB-A, Ethernet y video', 'Energía|Power Delivery al host']),
  ('twelve-south-hoverbar-duo', 'Twelve South HoverBar Duo', 'Twelve South', 'accesorios-computadora', 'Soporte articulado de escritorio para tabletas y pantallas compatibles.', 79, 8.2, array['Tipo|Brazo articulado de escritorio', 'Compatibilidad|Tabletas y dispositivos con abrazadera', 'Ajuste|Altura, inclinación y giro']),
  ('rain-design-mstand', 'Rain Design mStand', 'Rain Design', 'accesorios-computadora', 'Soporte de aluminio para elevar laptop y mejorar la postura de escritorio.', 49, 8.8, array['Tipo|Soporte elevador para laptop', 'Material|Aluminio', 'Compatibilidad|Laptops hasta 15 pulgadas']),
  ('rain-design-iroc-pro', 'Rain Design iLevel 2', 'Rain Design', 'accesorios-computadora', 'Soporte ajustable para laptop con mecanismo frontal de elevación.', 69, 8.4, array['Tipo|Soporte ajustable para laptop', 'Material|Aluminio', 'Ajuste|Altura e inclinación']),
  ('roost-laptop-stand-v3', 'Roost Laptop Stand v3', 'Roost', 'accesorios-computadora', 'Soporte portátil plegable y ajustable para laptop.', 89, 8.3, array['Tipo|Soporte portátil plegable', 'Material|Polímero reforzado', 'Ajuste|Altura regulable']),
  ('logitech-brio-4k', 'Logitech Brio 4K', 'Logitech', 'accesorios-computadora', 'Webcam Ultra HD con encuadre automático y corrección de luz.', 199, 8.4, array['Tipo|Webcam USB', 'Video|4K UHD hasta 30 fps', 'Conectividad|USB-C y USB-A']),
  ('logitech-brio-500', 'Logitech Brio 500', 'Logitech', 'accesorios-computadora', 'Webcam Full HD con corrección de luz y encuadre automático.', 129, 8.9, array['Tipo|Webcam USB', 'Video|Full HD 1080p hasta 30 fps', 'Característica|RightLight 4 y Show Mode']),
  ('elgato-facecam-mk2', 'Elgato Facecam MK.2', 'Elgato', 'accesorios-computadora', 'Webcam Full HD optimizada para streaming y videollamadas.', 149, 8.6, array['Tipo|Webcam USB para streaming', 'Video|1080p hasta 60 fps', 'Conectividad|USB-C']),
  ('obsbot-tiny-2-lite', 'OBSBOT Tiny 2 Lite', 'OBSBOT', 'accesorios-computadora', 'Webcam PTZ 4K con seguimiento por inteligencia artificial.', 179, 8.4, array['Tipo|Webcam PTZ', 'Video|4K UHD', 'Característica|Seguimiento AI y control por gestos']),
  ('anker-powerconf-c200', 'Anker PowerConf C200', 'Anker', 'accesorios-computadora', 'Webcam 2K con encuadre ajustable y cubierta de privacidad.', 59, 9.2, array['Tipo|Webcam USB', 'Video|2K QHD', 'Característica|Encuadre ajustable y cubierta de privacidad']),
  ('elgato-wave-3', 'Elgato Wave:3', 'Elgato', 'accesorios-computadora', 'Micrófono USB condensador para streaming, podcast y comunicación.', 149, 9.0, array['Tipo|Micrófono USB condensador', 'Patrón|Cardioide', 'Conectividad|USB-C y salida de audífonos']),
  ('hyperx-quadcast-s', 'HyperX QuadCast S', 'HyperX', 'accesorios-computadora', 'Micrófono USB con iluminación RGB y soporte antivibración.', 159, 8.7, array['Tipo|Micrófono USB condensador', 'Patrones|Estéreo, omnidireccional, cardioide y bidireccional', 'Conectividad|USB-C']),
  ('rode-nt-usb-plus', 'RØDE NT-USB+', 'RØDE', 'accesorios-computadora', 'Micrófono USB de calidad de estudio para podcast y grabación.', 169, 8.8, array['Tipo|Micrófono USB condensador', 'Patrón|Cardioide', 'Conectividad|USB-C y salida de audífonos']),
  ('fifine-am8', 'FIFINE AM8', 'FIFINE', 'accesorios-computadora', 'Micrófono dinámico USB/XLR para streaming y llamadas.', 59, 9.3, array['Tipo|Micrófono dinámico', 'Patrón|Cardioide', 'Conectividad|USB-C y XLR']),
  ('blue-yeti', 'Logitech Blue Yeti', 'Logitech', 'accesorios-computadora', 'Micrófono USB multipatrón para podcast, streaming y videollamadas.', 129, 8.8, array['Tipo|Micrófono USB condensador', 'Patrones|Cardioide, bidireccional, omnidireccional y estéreo', 'Conectividad|USB']),
  -- Cargadores y Accesorios de Energía (10)
  ('belkin-boostcharge-pro-3-in-1', 'Belkin BoostCharge Pro 3-in-1', 'Belkin', 'cargadores', 'Base de carga inalámbrica 3 en 1 para dispositivos Apple compatibles.', 149, 8.0, array['Tipo|Base de carga inalámbrica 3 en 1', 'Compatibilidad|iPhone, Apple Watch y AirPods', 'Carga|MagSafe hasta 15 W']),
  ('anker-737-charger-ganprime-120w', 'Anker 737 Charger GaNPrime 120W', 'Anker', 'cargadores', 'Cargador GaN multipuerto de alta potencia para laptop y dispositivos móviles.', 95, 9.0, array['Tipo|Cargador GaN', 'Puertos|2 USB-C y 1 USB-A', 'Potencia|Hasta 120 W']),
  ('ugreen-nexode-100w', 'UGREEN Nexode 100W GaN USB-C Charger', 'UGREEN', 'cargadores', 'Cargador GaN USB-C multipuerto para laptop, tablet y teléfono.', 69, 9.2, array['Tipo|Cargador GaN', 'Puertos|3 USB-C y 1 USB-A', 'Potencia|Hasta 100 W']),
  ('anker-prime-67w-gan-wall-charger', 'Anker Prime 67W GaN Wall Charger', 'Anker', 'cargadores', 'Cargador GaN compacto de 67 W para carga rápida de laptops, teléfonos y tabletas.', 59, 9.1, array['Tipo|Cargador GaN de pared', 'Puertos|USB-C multipuerto', 'Potencia|Hasta 67 W']),
  ('baseus-65w-gan3-pro-desktop-charger', 'Baseus 65W GaN3 Pro Desktop Charger', 'Baseus', 'cargadores', 'Cargador de escritorio GaN multipuerto para laptop, teléfono y accesorios.', 49, 8.9, array['Tipo|Cargador GaN de escritorio', 'Puertos|USB-C y USB-A', 'Potencia|Hasta 65 W']),
  ('belkin-boostcharge-pro-140w-4-port', 'Belkin BoostCharge Pro 140W 4-Port GaN Wall Charger', 'Belkin', 'cargadores', 'Cargador GaN de cuatro puertos con carga rápida para laptops y dispositivos móviles.', 119, 9.0, array['Tipo|Cargador GaN de pared', 'Puertos|4 USB-C/USB-A', 'Potencia|Hasta 140 W']),
  ('apple-140w-usb-c-power-adapter', 'Apple 140W USB-C Power Adapter', 'Apple', 'cargadores', 'Adaptador USB-C de alta potencia para carga rápida de MacBook y otros dispositivos compatibles.', 99, 8.7, array['Tipo|Adaptador USB-C', 'Puertos|1 USB-C', 'Potencia|Hasta 140 W']),
  ('anker-maggo-wireless-charging-station-3-in-1', 'Anker MagGo Wireless Charging Station (3-in-1 Foldable)', 'Anker', 'cargadores', 'Estación inalámbrica plegable para cargar teléfono, auriculares y smartwatch.', 109, 8.8, array['Tipo|Estación inalámbrica plegable', 'Compatibilidad|Teléfono, auriculares y smartwatch', 'Carga|Qi2 y carga simultánea']),
  ('anker-633-magnetic-battery-maggo', 'Anker 633 Magnetic Battery (MagGo)', 'Anker', 'cargadores', 'Batería magnética portátil con carga inalámbrica y puerto USB-C.', 69, 8.6, array['Tipo|Batería magnética portátil', 'Puertos|USB-C', 'Carga|Inalámbrica y cableada']),
  ('satechi-3-in-1-foldable-qi2-wireless-charger', 'Satechi 3-in-1 Foldable Qi2 Wireless Charging Stand', 'Satechi', 'cargadores', 'Base plegable Qi2 para carga inalámbrica simultánea de teléfono, auriculares y smartwatch.', 129, 8.7, array['Tipo|Base inalámbrica plegable', 'Compatibilidad|Teléfono, auriculares y smartwatch', 'Carga|Qi2 3 en 1']);

insert into categories (id, name, slug)
values
  (md5('techcompare:category:audio-auriculares')::uuid, 'Audio & Auriculares', 'audio-auriculares'),
  (md5('techcompare:category:wearables')::uuid, 'Relojes Inteligentes & Wearables', 'wearables'),
  (md5('techcompare:category:perifericos-pc')::uuid, 'Periféricos de PC', 'perifericos-pc'),
  (md5('techcompare:category:accesorios-computadora')::uuid, 'Accesorios de Computadora', 'accesorios-computadora'),
  (md5('techcompare:category:cargadores')::uuid, 'Cargadores y Accesorios de Energía', 'cargadores')
on conflict do nothing;

insert into brands (id, name, slug)
select distinct
  md5('techcompare:brand:' || lower(seed.brand))::uuid,
  seed.brand,
  regexp_replace(lower(seed.brand), '[^a-z0-9]+', '-', 'g')
from _techcompare_seed_products as seed
on conflict do nothing;

insert into stores (id, name, logo_url)
values
  (md5('techcompare:store:mercado-libre')::uuid, 'Mercado Libre', 'https://cdn.simpleicons.org/mercadolibre/FFE600'),
  (md5('techcompare:store:amazon')::uuid, 'Amazon', 'https://cdn.simpleicons.org/amazon/FFFFFF'),
  (md5('techcompare:store:best-buy')::uuid, 'Best Buy', 'https://cdn.simpleicons.org/bestbuy/0046BE')
on conflict do nothing;

create temp table _techcompare_scraped_images (
  slug text primary key,
  image_url text not null
) on commit drop;

insert into _techcompare_scraped_images (slug, image_url)
values
  ('apple-airpods-pro-2', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85'),
  ('apple-airpods-4-anc', 'https://images.unsplash.com/photo-1585298723682-7115561c51b7?auto=format&fit=crop&w=1200&q=85'),
  ('apple-airpods-4', 'https://images.unsplash.com/photo-1628116709703-c1c9ad550d36?auto=format&fit=crop&w=1200&q=85'),
  ('sony-wf-1000xm5', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85'),
  ('sony-wh-1000xm5', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=1200&q=85'),
  ('sony-wh-ch720n', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=85'),
  ('bose-quietcomfort-ultra-headphones', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=85'),
  ('bose-quietcomfort-headphones', 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=1200&q=85'),
  ('sennheiser-momentum-4-wireless', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1200&q=85'),
  ('sennheiser-momentum-true-wireless-4', 'https://images.unsplash.com/photo-1567928513899-997d98489fbd?auto=format&fit=crop&w=1200&q=85'),
  ('jbl-tour-pro-2', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1200&q=85'),
  ('jbl-live-pro-2', 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1200&q=85'),
  ('jbl-tune-770nc', 'https://images.unsplash.com/photo-1520170350707-b2da59970118?auto=format&fit=crop&w=1200&q=85'),
  ('samsung-galaxy-buds3-pro', 'https://images.unsplash.com/photo-1641048930621-ab5d225ae5b0?auto=format&fit=crop&w=1200&q=85'),
  ('samsung-galaxy-buds-fe', 'https://images.unsplash.com/photo-1606741965326-cb990ae01bb2?auto=format&fit=crop&w=1200&q=85'),
  ('google-pixel-buds-pro-2', 'https://images.unsplash.com/photo-1652383919512-52a1a7f82122?auto=format&fit=crop&w=1200&q=85'),
  ('nothing-ear-2024', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=85'),
  ('anker-soundcore-liberty-4-nc', 'https://images.unsplash.com/photo-1655560378428-7605bda51749?auto=format&fit=crop&w=1200&q=85'),
  ('anker-soundcore-space-one', 'https://images.unsplash.com/photo-1580236176063-bea7f16aec30?auto=format&fit=crop&w=1200&q=85'),
  ('beats-studio-pro', 'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&w=1200&q=85'),
  ('beats-fit-pro', 'https://images.unsplash.com/photo-1580477371194-4593e3c7c6cf?auto=format&fit=crop&w=1200&q=85'),
  ('razer-blackshark-v2-pro-2023', 'https://images.unsplash.com/photo-1628202926206-c63a34b1618f?auto=format&fit=crop&w=1200&q=85'),
  ('logitech-g-pro-x-2-lightspeed', 'https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=1200&q=85'),
  ('hyperx-cloud-iii-wireless', 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&w=1200&q=85'),
  ('steelseries-arctis-nova-7', 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&w=1200&q=85'),
  ('apple-watch-series-10-gps-42', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=85'),
  ('apple-watch-ultra-2', 'https://images.unsplash.com/photo-1637160151663-a410315e4e75?auto=format&fit=crop&w=1200&q=85'),
  ('apple-watch-se-2', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85'),
  ('samsung-galaxy-watch-ultra', 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=1200&q=85'),
  ('samsung-galaxy-watch7-44', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=85'),
  ('samsung-galaxy-fit3', 'https://images.unsplash.com/photo-1461141346587-763ab02bced9?auto=format&fit=crop&w=1200&q=85'),
  ('google-pixel-watch-3-45', 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&w=1200&q=85'),
  ('fitbit-charge-6', 'https://images.unsplash.com/photo-1660844817855-3ecc7ef21f12?auto=format&fit=crop&w=1200&q=85'),
  ('fitbit-sense-2', 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=1200&q=85'),
  ('garmin-forerunner-265', 'https://images.unsplash.com/photo-1624096104992-9b4fa3a279dd?auto=format&fit=crop&w=1200&q=85'),
  ('garmin-forerunner-165', 'https://images.unsplash.com/photo-1632794716789-42d9995fb5b6?auto=format&fit=crop&w=1200&q=85'),
  ('garmin-fenix-7-pro', 'https://images.unsplash.com/photo-1617043983671-adaadcaa2460?auto=format&fit=crop&w=1200&q=85'),
  ('garmin-vivoactive-5', 'https://images.unsplash.com/photo-1532435109783-fdb8a2be0baa?auto=format&fit=crop&w=1200&q=85'),
  ('xiaomi-smart-band-9', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=1200&q=85'),
  ('xiaomi-watch-2', 'https://images.unsplash.com/photo-1503328427499-d92d1ac3d174?auto=format&fit=crop&w=1200&q=85'),
  ('amazfit-balance', 'https://images.unsplash.com/photo-1620213391117-0d169a917221?auto=format&fit=crop&w=1200&q=85'),
  ('amazfit-active-2', 'https://images.unsplash.com/photo-1434494571168-ab162bce2813?auto=format&fit=crop&w=1200&q=85'),
  ('amazfit-t-rex-3', 'https://images.unsplash.com/photo-1696688713460-de12ac76ebc6?auto=format&fit=crop&w=1200&q=85'),
  ('oneplus-watch-2', 'https://images.unsplash.com/photo-1579721840641-7d0e67f1204e?auto=format&fit=crop&w=1200&q=85'),
  ('huawei-watch-gt-5-46', 'https://images.unsplash.com/photo-1434494817513-cc112a976e36?auto=format&fit=crop&w=1200&q=85'),
  ('huawei-watch-fit-3', 'https://images.unsplash.com/photo-1596236100223-f3c656de3038?auto=format&fit=crop&w=1200&q=85'),
  ('polar-ignite-3', 'https://images.unsplash.com/photo-1656053209629-8bdf3e494f91?auto=format&fit=crop&w=1200&q=85'),
  ('withings-scanwatch-2', 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=1200&q=85'),
  ('oura-ring-4', 'https://images.unsplash.com/photo-1517502474097-f9b30659dadb?auto=format&fit=crop&w=1200&q=85'),
  ('whoop-4-0', 'https://images.unsplash.com/photo-1517420879524-86d64ac2f339?auto=format&fit=crop&w=1200&q=85'),
  ('logitech-mx-keys-s', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=85'),
  ('logitech-g915-x-lightspeed', 'https://images.unsplash.com/photo-1625130694338-4110ba634e59?auto=format&fit=crop&w=1200&q=85'),
  ('logitech-g-pro-x-tkl-rapid', 'https://images.unsplash.com/photo-1635987391914-cb84b567e68f?auto=format&fit=crop&w=1200&q=85'),
  ('razer-blackwidow-v4-pro-75', 'https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?auto=format&fit=crop&w=1200&q=85'),
  ('razer-huntsman-v3-pro-tkl', 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?auto=format&fit=crop&w=1200&q=85'),
  ('corsair-k100-rgb', 'https://images.unsplash.com/photo-1636858507939-acc6b17bda52?auto=format&fit=crop&w=1200&q=85'),
  ('corsair-k70-core', 'https://images.unsplash.com/photo-1595044426077-d36d9236d54a?auto=format&fit=crop&w=1200&q=85'),
  ('keychron-q1-pro', 'https://images.unsplash.com/photo-1632079003110-d694908500da?auto=format&fit=crop&w=1200&q=85'),
  ('keychron-k2-pro', 'https://images.unsplash.com/photo-1626958390898-162d3577f293?auto=format&fit=crop&w=1200&q=85'),
  ('steelseries-apex-pro-tkl-wireless-2023', 'https://images.unsplash.com/photo-1696710257827-75e2e5954059?auto=format&fit=crop&w=1200&q=85'),
  ('logitech-mx-master-3s', 'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?auto=format&fit=crop&w=1200&q=85'),
  ('logitech-mx-anywhere-3s', 'https://images.unsplash.com/photo-1558050032-160f36233a07?auto=format&fit=crop&w=1200&q=85'),
  ('logitech-g-pro-x-superlight-2', 'https://images.unsplash.com/photo-1651012998667-2c779fee76f8?auto=format&fit=crop&w=1200&q=85'),
  ('logitech-g502-x-plus', 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?auto=format&fit=crop&w=1200&q=85'),
  ('razer-deathadder-v3-pro', 'https://images.unsplash.com/photo-1626958390943-a70309376444?auto=format&fit=crop&w=1200&q=85'),
  ('razer-viper-v3-pro', 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=1200&q=85'),
  ('razer-basilisk-v3-pro-35k', 'https://images.unsplash.com/photo-1626218174358-7769486c4b79?auto=format&fit=crop&w=1200&q=85'),
  ('steelseries-aerox-5-wireless', 'https://images.unsplash.com/photo-1598662779094-110c2bad80b5?auto=format&fit=crop&w=1200&q=85'),
  ('corsair-dark-core-rgb-pro-se', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=85'),
  ('glorious-model-o-2-wireless', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=85'),
  ('steelseries-qck-heavy-large', 'https://images.unsplash.com/photo-1636487658616-14850c8f496c?auto=format&fit=crop&w=1200&q=85'),
  ('logitech-g840-xl', 'https://images.unsplash.com/photo-1636489953081-c4ebbd50fa3a?auto=format&fit=crop&w=1200&q=85'),
  ('razer-strider-large', 'https://images.unsplash.com/photo-1551515300-2d3b7bb80920?auto=format&fit=crop&w=1200&q=85'),
  ('corsair-mm700-rgb-extended', 'https://images.unsplash.com/photo-1708481480603-b47ea65c80b6?auto=format&fit=crop&w=1200&q=85'),
  ('hyperx-pulsefire-mat-2xl', 'https://images.unsplash.com/photo-1613141411244-0e4ac259d217?auto=format&fit=crop&w=1200&q=85'),
  ('anker-555-usb-c-hub-8-in-1', 'https://images.unsplash.com/photo-1577375729078-820d5283031c?auto=format&fit=crop&w=1200&q=85'),
  ('anker-555-usb-c-dock-13-in-1', 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1200&q=85'),
  ('anker-778-thunderbolt-docking-station', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85'),
  ('caldigit-ts4-thunderbolt-station', 'https://images.unsplash.com/photo-1627281796892-39e266ee50be?auto=format&fit=crop&w=1200&q=85'),
  ('belkin-connect-pro-thunderbolt-4-dock', 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=1200&q=85'),
  ('ugreen-revodok-pro-109', 'https://images.unsplash.com/photo-1620283085068-5aab84e2db8e?auto=format&fit=crop&w=1200&q=85'),
  ('satechi-multiport-8k-v3', 'https://images.unsplash.com/photo-1593687395549-400945fed803?auto=format&fit=crop&w=1200&q=85'),
  ('wavlink-thunderbolt-4-dock', 'https://images.unsplash.com/photo-1672165407773-20262ff6ab13?auto=format&fit=crop&w=1200&q=85'),
  ('twelve-south-hoverbar-duo', 'https://images.unsplash.com/photo-1669480380756-f82b044e8144?auto=format&fit=crop&w=1200&q=85'),
  ('rain-design-mstand', 'https://images.unsplash.com/photo-1623949556303-b0d17d198863?auto=format&fit=crop&w=1200&q=85'),
  ('rain-design-iroc-pro', 'https://images.unsplash.com/photo-1587302912306-cf1ed9c33146?auto=format&fit=crop&w=1200&q=85'),
  ('roost-laptop-stand-v3', 'https://images.unsplash.com/photo-1626581795188-8efb9a00eeec?auto=format&fit=crop&w=1200&q=85'),
  ('logitech-brio-4k', 'https://images.unsplash.com/photo-1602526432604-029a709e131c?auto=format&fit=crop&w=1200&q=85'),
  ('logitech-brio-500', 'https://images.unsplash.com/photo-1554200876-907f9286c2a1?auto=format&fit=crop&w=1200&q=85'),
  ('elgato-facecam-mk2', 'https://images.unsplash.com/photo-1636569826709-8e07f6104992?auto=format&fit=crop&w=1200&q=85'),
  ('obsbot-tiny-2-lite', 'https://images.unsplash.com/photo-1594359640393-160e1cfeef0e?auto=format&fit=crop&w=1200&q=85'),
  ('anker-powerconf-c200', 'https://images.unsplash.com/photo-1619190324856-af3f6eb55601?auto=format&fit=crop&w=1200&q=85'),
  ('elgato-wave-3', 'https://images.unsplash.com/photo-1626581806599-d12b0bbd4225?auto=format&fit=crop&w=1200&q=85'),
  ('hyperx-quadcast-s', 'https://images.unsplash.com/photo-1625123625854-43c9e8da9803?auto=format&fit=crop&w=1200&q=85'),
  ('rode-nt-usb-plus', 'https://images.unsplash.com/photo-1622750342107-4b60e2704157?auto=format&fit=crop&w=1200&q=85'),
  ('fifine-am8', 'https://images.unsplash.com/photo-1620348485716-7dbc0ef9ddcd?auto=format&fit=crop&w=1200&q=85'),
  ('blue-yeti', 'https://images.unsplash.com/photo-1616578273461-3a99ce422de6?auto=format&fit=crop&w=1200&q=85'),
  ('belkin-boostcharge-pro-3-in-1', 'https://images.unsplash.com/photo-1623738244303-a645cef7aafa?auto=format&fit=crop&w=1200&q=85'),
  ('anker-737-charger-ganprime-120w', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=85'),
  ('ugreen-nexode-100w', 'https://images.unsplash.com/photo-1731616103600-3fe7ccdc5a59?auto=format&fit=crop&w=1200&q=85'),
  ('anker-prime-67w-gan-wall-charger', 'https://images.unsplash.com/photo-1727885796960-70a0adfe40ef?auto=format&fit=crop&w=1200&q=85'),
  ('baseus-65w-gan3-pro-desktop-charger', 'https://images.unsplash.com/photo-1603539495824-bf9158834f09?auto=format&fit=crop&w=1200&q=85'),
  ('belkin-boostcharge-pro-140w-4-port', 'https://images.unsplash.com/photo-1725304382197-663ae3864750?auto=format&fit=crop&w=1200&q=85'),
  ('apple-140w-usb-c-power-adapter', 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&w=1200&q=85'),
  ('anker-maggo-wireless-charging-station-3-in-1', 'https://images.unsplash.com/photo-1586254116648-d33e0fada133?auto=format&fit=crop&w=1200&q=85'),
  ('anker-633-magnetic-battery-maggo', 'https://images.unsplash.com/photo-1517320069935-381614f8c1e5?auto=format&fit=crop&w=1200&q=85'),
  ('satechi-3-in-1-foldable-qi2-wireless-charger', 'https://images.unsplash.com/photo-1624275353151-f21e28a7dfaa?auto=format&fit=crop&w=1200&q=85')
;

insert into products
  (id, name, slug, brand_id, category_id, description, image_url, quality_price_score)
select
  md5('techcompare:product:' || seed.slug)::uuid,
  seed.name,
  seed.slug,
  brand.id,
  category.id,
  seed.description,
  scraped.image_url,
  seed.quality_price_score
from _techcompare_seed_products as seed
join brands as brand on lower(brand.name) = lower(seed.brand)
join categories as category on category.slug = seed.category_slug
left join _techcompare_scraped_images as scraped on scraped.slug = seed.slug
ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url;

insert into product_reviews (id, product_id, user_name, rating, comment)
select
  md5('techcompare:demo-review:' || review_seed.product_slug)::uuid,
  product.id,
  review_seed.user_name,
  review_seed.rating,
  review_seed.comment
from (
  values
    ('apple-airpods-pro-2'::text, 'Usuario demo', 5, 'Reseña de ejemplo: buena cancelación de ruido y un formato cómodo para el uso diario.'::text),
    ('apple-watch-series-10-gps-42'::text, 'Usuario demo', 4, 'Reseña de ejemplo: pantalla clara y funciones útiles para seguir la actividad diaria.'::text)
) as review_seed(product_slug, user_name, rating, comment)
join products as product on product.slug = review_seed.product_slug
on conflict (id) do nothing;

-- Three retailer search offers per product. Replace these sample prices and URLs
-- with verified current offers and your actual affiliate parameters.
insert into product_offers
  (id, product_id, store_id, price, currency, affiliate_url, in_stock)
select
  md5('techcompare:offer:' || seed.slug || ':' || retailer.store_key)::uuid,
  product.id,
  store.id,
  greatest(round(seed.price * retailer.price_factor, 2), 30.00::numeric),
  'USD',
  retailer.search_url || replace(replace(seed.name, ' ', '+'), '&', '%26'),
  true
from _techcompare_seed_products as seed
cross join (
  values
    ('mercado-libre'::text, 1.00::numeric, 'https://listado.mercadolibre.com.ec/'::text),
    ('amazon'::text, 1.06::numeric, 'https://www.amazon.com/s?k='::text),
    ('best-buy'::text, 1.08::numeric, 'https://www.bestbuy.com/site/searchpage.jsp?st='::text)
) as retailer(store_key, price_factor, search_url)
join products as product on product.slug = seed.slug
join stores as store on store.name = case retailer.store_key
  when 'mercado-libre' then 'Mercado Libre'
  when 'best-buy' then 'Best Buy'
  else 'Amazon'
end
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;

insert into product_specs (id, product_id, spec_key, spec_value)
select
  md5('techcompare:spec:' || seed.slug || ':' || split_part(spec.value, '|', 1))::uuid,
  product.id,
  split_part(spec.value, '|', 1),
  substring(spec.value from position('|' in spec.value) + 1)
from _techcompare_seed_products as seed
join products as product on product.slug = seed.slug
cross join lateral unnest(seed.specs) as spec(value)
on conflict do nothing;

commit;
