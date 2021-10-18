-- change cte to cteee
WITH RECURSIVE cteee AS (
	SELECT 
        ch.CategoryID
        , c.Name AS name
        , c.LongName AS longName
        , ch.ParentCategoryID ParentCategoryID
        , 1 AS CategoryLevelID 
		, row_number() OVER(ORDER BY ch.CategoryID) AS child
	FROM tblLUCategoryHeirarcharies ch 
	JOIN tblLUCategories c ON c.CategoryID = ch.CategoryID 
	WHERE ch.ParentCategoryID = 1416
)
, cte1(ParentCategoryID, CategoryID, CategoryLevelID, child) AS (
	SELECT ParentCategoryID, CategoryID, CategoryLevelID, child FROM cte
	UNION ALL
	SELECT ch.ParentCategoryID, c.CategoryID, CategoryLevelID + 1, child FROM cte c JOIN tblLUCategoryHeirarcharies ch ON ch.ParentCategoryID = c.CategoryID
)
SELECT 
	c.CategoryID AS categoryID
	, c.name
	, c.longName
	, c.parentCategoryID
	, (SELECT MAX(CategoryLevelID) FROM cte1 GROUP BY child) AS categoryLevelID
	, NULL AS itemCount
FROM 
	cte1 c1
JOIN cte c ON c.ParentCategoryID = c1.ParentCategoryID
GROUP BY c.CategoryID