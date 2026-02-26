-- Extend Images table to store viewer annotations (e.g., bounding boxes, polygons)
alter table images add column if not exists annotations_json jsonb;
