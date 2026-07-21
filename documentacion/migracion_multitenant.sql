-- ============================================================
-- MIGRACIÓN MULTI-TENANT: Sistema Minimarket
-- ============================================================
-- Ejecutar sobre la BDD existente (minimarket_db)
-- Envuelto en transacción: si algo falla, no se aplica nada
-- ============================================================

BEGIN;

-- ============================================================
-- 1. FUNCIÓN TRIGGER: auto-actualizar updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION fn_actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. TABLA: tiendas (entidad central multi-tenant)
-- ============================================================
CREATE TABLE IF NOT EXISTS tiendas (
    id_tienda       SERIAL          PRIMARY KEY,
    nombre          VARCHAR(100)    NOT NULL,
    slug            VARCHAR(100)    NOT NULL UNIQUE,
    direccion       VARCHAR(200),
    telefono        VARCHAR(30),
    logo_url        TEXT,
    descripcion     VARCHAR(300),
    estado          BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tiendas_estado ON tiendas(estado);

DROP TRIGGER IF EXISTS trg_tiendas_updated_at ON tiendas;
CREATE TRIGGER trg_tiendas_updated_at
    BEFORE UPDATE ON tiendas
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();

-- ============================================================
-- 3. TABLA: tienda_usuario (quién trabaja en qué tienda)
-- ============================================================
CREATE TABLE IF NOT EXISTS tienda_usuario (
    id              SERIAL          PRIMARY KEY,
    id_tienda       INT             NOT NULL,
    id_usuario      BIGINT          NOT NULL,
    rol_tienda      VARCHAR(30)     NOT NULL,
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tu_tienda
        FOREIGN KEY (id_tienda)  REFERENCES tiendas(id_tienda)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_tu_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_tienda_usuario
        UNIQUE(id_tienda, id_usuario),
    CONSTRAINT chk_rol_tienda
        CHECK (rol_tienda IN (
            'Propietario',
            'Administrador',
            'Cajero',
            'Reposicion'
        ))
);

CREATE INDEX IF NOT EXISTS idx_tu_tienda  ON tienda_usuario(id_tienda);
CREATE INDEX IF NOT EXISTS idx_tu_usuario ON tienda_usuario(id_usuario);

-- ============================================================
-- 4. AGREGAR updated_at A TABLAS QUE NO LO TIENEN
-- ============================================================
ALTER TABLE categorias              ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
ALTER TABLE anaqueles                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
ALTER TABLE productos                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
ALTER TABLE alertas_stock            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- Triggers de updated_at
DROP TRIGGER IF EXISTS trg_categorias_updated_at ON categorias;
CREATE TRIGGER trg_categorias_updated_at
    BEFORE UPDATE ON categorias
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();

DROP TRIGGER IF EXISTS trg_anaqueles_updated_at ON anaqueles;
CREATE TRIGGER trg_anaqueles_updated_at
    BEFORE UPDATE ON anaqueles
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();

DROP TRIGGER IF EXISTS trg_productos_updated_at ON productos;
CREATE TRIGGER trg_productos_updated_at
    BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();

-- ============================================================
-- 5. DROPEAR VISTAS (dependen de las tablas que vamos a alterar)
-- ============================================================
DROP VIEW IF EXISTS vista_productos_stock    CASCADE;
DROP VIEW IF EXISTS vista_ventas_detalle     CASCADE;
DROP VIEW IF EXISTS vista_inventario_alertas CASCADE;
DROP VIEW IF EXISTS vista_tienda_resumen     CASCADE;
DROP VIEW IF EXISTS vista_tienda_usuarios    CASCADE;
DROP VIEW IF EXISTS vista_dashboard_kpis     CASCADE;

-- ============================================================
-- 6. AGREGAR COLUMNA id_tienda (nullable primero)
-- ============================================================
ALTER TABLE categorias          ADD COLUMN IF NOT EXISTS id_tienda INT;
ALTER TABLE anaqueles            ADD COLUMN IF NOT EXISTS id_tienda INT;
ALTER TABLE productos            ADD COLUMN IF NOT EXISTS id_tienda INT;
ALTER TABLE ventas               ADD COLUMN IF NOT EXISTS id_tienda INT;
ALTER TABLE reportes_inventario  ADD COLUMN IF NOT EXISTS id_tienda INT;

-- ============================================================
-- 7. INSERTAR TIENDA POR DEFECTO + MIGRAR DATOS EXISTENTES
-- ============================================================
INSERT INTO tiendas (id_tienda, nombre, slug, direccion, descripcion)
VALUES (1, 'MiniMarket Central', 'minimarket-central',
        'Av. Mariscal Castilla 320, Ilo',
        'Tienda principal del sistema')
ON CONFLICT (slug) DO NOTHING;

SELECT setval('tiendas_id_tienda_seq', (SELECT MAX(id_tienda) FROM tiendas));

-- Asignar usuario existente (id=1) como propietario
INSERT INTO tienda_usuario (id_tienda, id_usuario, rol_tienda)
SELECT 1, id_usuario, 'Propietario'
FROM usuarios WHERE id_usuario = 1
ON CONFLICT (id_tienda, id_usuario) DO NOTHING;

-- Migrar todos los datos huérfanos a tienda 1
UPDATE categorias          SET id_tienda = 1 WHERE id_tienda IS NULL;
UPDATE anaqueles            SET id_tienda = 1 WHERE id_tienda IS NULL;
UPDATE productos            SET id_tienda = 1 WHERE id_tienda IS NULL;
UPDATE ventas               SET id_tienda = 1 WHERE id_tienda IS NULL;
UPDATE reportes_inventario  SET id_tienda = 1 WHERE id_tienda IS NULL;

-- ============================================================
-- 8. HACER NOT NULL + AGREGAR FOREIGN KEYS
-- ============================================================
ALTER TABLE categorias          ALTER COLUMN id_tienda SET NOT NULL;
ALTER TABLE anaqueles            ALTER COLUMN id_tienda SET NOT NULL;
ALTER TABLE productos            ALTER COLUMN id_tienda SET NOT NULL;
ALTER TABLE ventas               ALTER COLUMN id_tienda SET NOT NULL;
ALTER TABLE reportes_inventario  ALTER COLUMN id_tienda SET NOT NULL;

-- Eliminar constraints FK si ya existen para evitar errores al re-crear
ALTER TABLE categorias DROP CONSTRAINT IF EXISTS fk_categorias_tiendas;
ALTER TABLE categorias ADD CONSTRAINT fk_categorias_tiendas
    FOREIGN KEY (id_tienda) REFERENCES tiendas(id_tienda)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE anaqueles DROP CONSTRAINT IF EXISTS fk_anaqueles_tiendas;
ALTER TABLE anaqueles ADD CONSTRAINT fk_anaqueles_tiendas
    FOREIGN KEY (id_tienda) REFERENCES tiendas(id_tienda)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE productos DROP CONSTRAINT IF EXISTS fk_productos_tiendas;
ALTER TABLE productos ADD CONSTRAINT fk_productos_tiendas
    FOREIGN KEY (id_tienda) REFERENCES tiendas(id_tienda)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ventas DROP CONSTRAINT IF EXISTS fk_ventas_tiendas;
ALTER TABLE ventas ADD CONSTRAINT fk_ventas_tiendas
    FOREIGN KEY (id_tienda) REFERENCES tiendas(id_tienda)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE reportes_inventario DROP CONSTRAINT IF EXISTS fk_reportes_tiendas;
ALTER TABLE reportes_inventario ADD CONSTRAINT fk_reportes_tiendas
    FOREIGN KEY (id_tienda) REFERENCES tiendas(id_tienda)
    ON UPDATE CASCADE ON DELETE CASCADE;

-- ============================================================
-- 9. ACTUALIZAR CONSTRAINTS UNIQUE → por tienda
-- ============================================================
-- categorias: nombre único POR TIENDA (antes era global)
ALTER TABLE categorias DROP CONSTRAINT IF EXISTS categorias_nombre_key;
ALTER TABLE categorias DROP CONSTRAINT IF EXISTS uq_categorias_nombre_tienda;
ALTER TABLE categorias ADD CONSTRAINT uq_categorias_nombre_tienda
    UNIQUE(id_tienda, nombre);

-- anaqueles: codigo único POR TIENDA
ALTER TABLE anaqueles DROP CONSTRAINT IF EXISTS anaqueles_codigo_key;
ALTER TABLE anaqueles DROP CONSTRAINT IF EXISTS uq_anaqueles_codigo_tienda;
ALTER TABLE anaqueles ADD CONSTRAINT uq_anaqueles_codigo_tienda
    UNIQUE(id_tienda, codigo);

-- productos: codigo único POR TIENDA
ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_codigo_key;
ALTER TABLE productos DROP CONSTRAINT IF EXISTS uq_productos_codigo_tienda;
ALTER TABLE productos ADD CONSTRAINT uq_productos_codigo_tienda
    UNIQUE(id_tienda, codigo);

-- ============================================================
-- 10. ÍNDICES PARA id_tienda
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_categorias_tienda  ON categorias(id_tienda);
CREATE INDEX IF NOT EXISTS idx_anaqueles_tienda   ON anaqueles(id_tienda);
CREATE INDEX IF NOT EXISTS idx_productos_tienda   ON productos(id_tienda);
CREATE INDEX IF NOT EXISTS idx_ventas_tienda      ON ventas(id_tienda);
CREATE INDEX IF NOT EXISTS idx_reportes_tienda    ON reportes_inventario(id_tienda);

-- ============================================================
-- 11. RECREAR VISTAS CON SOPORTE MULTI-TENANT
-- ============================================================

-- Vista: productos con stock (filtrable por id_tienda)
CREATE VIEW vista_productos_stock AS
SELECT
    p.id_producto,
    p.id_tienda,
    p.codigo,
    p.nombre,
    p.descripcion,
    p.precio,
    p.estado,
    c.nombre          AS categoria,
    a.codigo          AS codigo_anaquel,
    a.nombre          AS anaquel,
    a.ubicacion,
    i.stock_actual,
    i.stock_minimo,
    CASE
        WHEN i.stock_actual IS NULL        THEN 'Sin inventario'
        WHEN i.stock_actual = 0            THEN 'Agotado'
        WHEN i.stock_actual <= (i.stock_minimo * 0.5)
                                           THEN 'Crítico'
        WHEN i.stock_actual <= i.stock_minimo
                                           THEN 'Stock bajo'
        ELSE 'Disponible'
    END AS estado_stock
FROM productos p
    JOIN categorias c       ON p.id_categoria = c.id_categoria
    LEFT JOIN anaqueles a   ON p.id_anaquel   = a.id_anaquel
    LEFT JOIN inventario i  ON p.id_producto  = i.id_producto
WHERE p.estado = true;

-- Vista: detalle de ventas (filtrable por id_tienda)
CREATE VIEW vista_ventas_detalle AS
SELECT
    v.id_venta,
    v.id_tienda,
    v.fecha,
    v.total,
    v.metodo_pago,
    v.estado,
    (u.nombre || ' ' || COALESCE(u.apellido, ''))  AS trabajador,
    p.nombre                                        AS producto,
    dv.cantidad,
    dv.precio_unitario,
    dv.subtotal
FROM ventas v
    JOIN usuarios u         ON v.id_trabajador = u.id_usuario
    JOIN detalle_ventas dv  ON v.id_venta      = dv.id_venta
    JOIN productos p        ON dv.id_producto  = p.id_producto;

-- Vista: alertas de inventario (filtrable por id_tienda)
CREATE VIEW vista_inventario_alertas AS
SELECT
    i.id_inventario,
    p.id_tienda,
    p.id_producto,
    p.codigo,
    p.nombre          AS producto,
    c.nombre          AS categoria,
    a.codigo          AS codigo_anaquel,
    a.nombre          AS anaquel,
    i.stock_actual,
    i.stock_minimo,
    CASE
        WHEN i.stock_actual = 0                       THEN 'Agotado'
        WHEN i.stock_actual <= (i.stock_minimo * 0.5) THEN 'Crítico'
        WHEN i.stock_actual <= i.stock_minimo         THEN 'Stock bajo'
        ELSE 'Normal'
    END AS nivel_alerta,
    i.fecha_actualizacion
FROM inventario i
    JOIN productos p        ON i.id_producto  = p.id_producto
    JOIN categorias c       ON p.id_categoria = c.id_categoria
    LEFT JOIN anaqueles a   ON p.id_anaquel   = a.id_anaquel
WHERE p.estado = true;

-- Vista: resumen por tienda (para pantalla "Mis tiendas")
CREATE VIEW vista_tienda_resumen AS
SELECT
    t.id_tienda,
    t.nombre,
    t.slug,
    t.direccion,
    t.logo_url,
    t.estado,
    (SELECT COUNT(*) FROM anaqueles a
        WHERE a.id_tienda = t.id_tienda AND a.estado = true
    ) AS total_anaqueles,
    (SELECT COUNT(*) FROM productos p
        WHERE p.id_tienda = t.id_tienda AND p.estado = true
    ) AS total_productos,
    (SELECT COUNT(*) FROM tienda_usuario tu
        WHERE tu.id_tienda = t.id_tienda AND tu.activo = true
    ) AS total_usuarios
FROM tiendas t;

-- Vista: usuarios de una tienda (para pantalla "Usuarios de la tienda")
CREATE VIEW vista_tienda_usuarios AS
SELECT
    tu.id,
    tu.id_tienda,
    tu.id_usuario,
    tu.rol_tienda,
    tu.activo,
    u.nombre,
    u.apellido,
    u.email,
    u.avatar_url,
    u.ultimo_login
FROM tienda_usuario tu
    JOIN usuarios u ON tu.id_usuario = u.id_usuario;

-- Vista: dashboard KPIs (para el dashboard ejecutivo por tienda)
CREATE VIEW vista_dashboard_kpis AS
SELECT
    v.id_tienda,
    -- Ventas de hoy
    COALESCE(SUM(v.total) FILTER (
        WHERE v.fecha::date = CURRENT_DATE
        AND v.estado = 'Registrada'
    ), 0) AS ventas_hoy,
    COALESCE(COUNT(*) FILTER (
        WHERE v.fecha::date = CURRENT_DATE
        AND v.estado = 'Registrada'
    ), 0) AS transacciones_hoy,
    -- Ventas últimos 7 días
    COALESCE(SUM(v.total) FILTER (
        WHERE v.fecha >= (CURRENT_DATE - INTERVAL '7 days')
        AND v.estado = 'Registrada'
    ), 0) AS ventas_7dias,
    COALESCE(COUNT(*) FILTER (
        WHERE v.fecha >= (CURRENT_DATE - INTERVAL '7 days')
        AND v.estado = 'Registrada'
    ), 0) AS boletas_7dias,
    -- Ticket promedio 7 días
    COALESCE(AVG(v.total) FILTER (
        WHERE v.fecha >= (CURRENT_DATE - INTERVAL '7 days')
        AND v.estado = 'Registrada'
    ), 0) AS ticket_promedio_7dias
FROM ventas v
GROUP BY v.id_tienda;

-- ============================================================
-- 12. TRIGGER: auto-actualizar updated_at en usuarios
--     (por si no existe)
-- ============================================================
DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();

-- ============================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================

COMMIT;
