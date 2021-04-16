WITH RECURSIVE cte AS (
    SELECT 
        c.CategoryID AS categoryID
        ,c.Name AS name
        ,c.LongName AS longName
        ,ifnull(ch.ParentCategoryID, c.CategoryID) AS ParentCategoryID
        ,ch.CategoryID
        ,CASE WHEN ch.CategoryID IS NULL THEN 1 ELSE 2 END AS CategoryLevelID 
    FROM 
        tblLUCategories c 
    LEFT JOIN 
        tblLUCategoryHeirarcharies ch ON ch.ParentCategoryID = c.CategoryID 
    WHERE 
        c.TenantID = (SELECT TenantID FROM Store)
    AND
        c.StoreID = (SELECT StoreID FROM Store)
    AND
        c.IsActive = 1
    AND 
        c.CategoryID NOT IN (
        SELECT c1.CategoryID
        FROM 
            tblLUCategories c1
        JOIN 
            tblLUCategoryHeirarcharies ch
        ON
            ch.CategoryID = c1.CategoryID
        WHERE
            c1.TenantID = (SELECT TenantID FROM Store)
        AND
            c1.StoreID = (SELECT StoreID FROM Store)
        AND
            c1.IsActive = 1
        )
    GROUP BY ParentCategoryID
)
, cte1(ParentCategoryID, CategoryID, CategoryLevelID) AS (
    SELECT ParentCategoryID, CategoryID, CategoryLevelID FROM cte
    UNION ALL
    SELECT ch.ParentCategoryID, ch.CategoryID, CategoryLevelID + 1 FROM cte c JOIN tblLUCategoryHeirarcharies ch ON ch.ParentCategoryID = c.CategoryID WHERE c.CategoryID NOT NULL
)
SELECT 
    cte.ParentCategoryID AS categoryID
    , cte.name
    , cte.longName
    , null AS parentCategoryID
    , MAX(cte1.CategoryLevelID) AS CategoryLevelID 
    , null AS itemCount
FROM 
    cte, cte1
GROUP BY cte.ParentCategoryID