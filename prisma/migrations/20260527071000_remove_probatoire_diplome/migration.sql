DELETE FROM "documents" WHERE "diplomeType"::text = 'PROBATOIRE' AND "typeDocument"::text = 'ORIGINAL';

UPDATE "documents"
SET "antenneRegionaleId" = CASE
  WHEN COALESCE("regionComposition", 'Centre') = 'Adamaoua' THEN 'antenne-adamaoua'
  WHEN COALESCE("regionComposition", 'Centre') = 'Est' THEN 'antenne-est'
  WHEN COALESCE("regionComposition", 'Centre') = 'Extreme-Nord' THEN 'antenne-extreme-nord'
  WHEN COALESCE("regionComposition", 'Centre') = 'Littoral' THEN 'antenne-littoral'
  WHEN COALESCE("regionComposition", 'Centre') = 'Nord' THEN 'antenne-nord'
  WHEN COALESCE("regionComposition", 'Centre') = 'Nord-Ouest' THEN 'antenne-nord-ouest'
  WHEN COALESCE("regionComposition", 'Centre') = 'Ouest' THEN 'antenne-ouest'
  WHEN COALESCE("regionComposition", 'Centre') = 'Sud' THEN 'antenne-sud'
  WHEN COALESCE("regionComposition", 'Centre') = 'Sud-Ouest' THEN 'antenne-sud-ouest'
  ELSE 'antenne-centre'
END
WHERE "organismeId" = 'org-obc';

UPDATE "duplicatas"
SET "antenneRegionaleId" = CASE
  WHEN COALESCE("regionComposition", 'Centre') = 'Adamaoua' THEN 'antenne-adamaoua'
  WHEN COALESCE("regionComposition", 'Centre') = 'Est' THEN 'antenne-est'
  WHEN COALESCE("regionComposition", 'Centre') = 'Extreme-Nord' THEN 'antenne-extreme-nord'
  WHEN COALESCE("regionComposition", 'Centre') = 'Littoral' THEN 'antenne-littoral'
  WHEN COALESCE("regionComposition", 'Centre') = 'Nord' THEN 'antenne-nord'
  WHEN COALESCE("regionComposition", 'Centre') = 'Nord-Ouest' THEN 'antenne-nord-ouest'
  WHEN COALESCE("regionComposition", 'Centre') = 'Ouest' THEN 'antenne-ouest'
  WHEN COALESCE("regionComposition", 'Centre') = 'Sud' THEN 'antenne-sud'
  WHEN COALESCE("regionComposition", 'Centre') = 'Sud-Ouest' THEN 'antenne-sud-ouest'
  ELSE 'antenne-centre'
END
WHERE "organismeId" = 'org-obc';
