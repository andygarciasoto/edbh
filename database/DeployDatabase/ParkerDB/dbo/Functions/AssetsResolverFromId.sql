CREATE     FUNCTION [dbo].[AssetsResolverFromId] 
(                   @asset_id           INT,
                    @aggregation_type   TINYINT
)
RETURNS TABLE
-- =============================================
-- Copyright © 2018 Ernst & Young LLP
-- All Rights Reserved
-- Author:      Gustavo Perez Espinoza
-- Create date: 17/7/2018
-- Description: Gets the hierarchy of an specific asset
-- =============================================
-- =============================================
-- ...
-- Parameters:
--   @asset_id                   - This parameter specific which Asset the function is going to search
--                               ____________ A ____________
--                           /                |                     \
--                          /                       |                         \
--                        /                        |                        \
--                        B                         C                          D
--                     /|                     /\                          |\
--                    / |                  /  \                            | \
--                  /  |                 /    \                    |  \
--                  E      F                   G           H                     I   J
--              /|  |\                  /\           /\                  /|      |\
--             / |  | \             /  \         /  \                   / |      | \
--           /  |  |  \     /    \  /    \       /  |        |  \
--           K      L      M      N      O        P  Q             R        S      T        U      V    
--           |   |   |   |    |     |  |     |     |   |   |   |
--           |   |   |   |    |     |  |     |     |   |   |   |
--           |   |   |   |    |     |  |     |     |   |   |   |
--           W      X      Y      Z      AA       AB AC     AD     AE   AF  AG  AH
--     
--     Target for the examples => C
--     @aggregation_type         - Parameter that specific which kind or levels of hierarchy that the function is going to return     
--         None                                = 0,   =>(C)
--         Children                     = 1,   =>(G,H)
--         ChildrenRecursive            = 2,   =>(G,O,AA,P,AB,H,Q,AC,R,AD)
--         Recursive                    = 3,   =>(C,G,O,AA,P,AB,H,Q,AC,R,AD)

-- Returns:    Return all hierarchy of one asset in specific
-- =============================================
-- =============================================
-- ...
-- Returns:    Return all hierarchy of one asset in specific
--Paramters
--           @asset_codes=5
--           @aggregation_type = 2
--Output
--           6      Processing Area     0      NULL                5      AKY Sauce Co
--           9      Mixing              6      Processing Area     5      AKY Sauce Co
--           31     E6                        6      Processing Area     5       AKY Sauce Co
--           46     P6Counter           6      Processing Area     5      AKY Sauce Co
--           76     W2                        6      Processing Area     5       AKY Sauce Co
-- =============================================
AS 
RETURN

  (          WITH CTE_ASSET_HIERARCHY 
             AS(
                    SELECT       0 AS Level,
                                 A1.asset_id							AS asset_id,                   
                                 CAST(0 AS INT)                         AS parent_id,                       
                                 A1.asset_id                            AS requested_asset_id,
                                 A1.asset_code                          AS asset_code
                    FROM dbo.Asset A1
                    WHERE A1.asset_id = @asset_id
       
                    UNION ALL

                    SELECT  CTE.Level+1 AS Level,
                                 A.asset_id,
                                 CTE.parent_id,                     
                                 CTE.requested_asset_id,
                                 A.asset_code
                    FROM CTE_ASSET_HIERARCHY CTE
                          INNER JOIN dbo.Asset A
                                 ON CTE.asset_code = A.parent_asset_code 
                                 AND ( (@aggregation_type=0 AND CTE.Level+1<1)
                                              OR     (@aggregation_type=1 AND CTE.Level+1<2)
                                              OR     @aggregation_type IN (2,3)
                                       ) 
                    
             )
             SELECT 
                          CTE.asset_id,                          
                          CTE.requested_asset_id
             FROM CTE_ASSET_HIERARCHY CTE
             WHERE (CTE.Level >0 AND @aggregation_type IN (1,2)) OR (CTE.Level >-1 AND @aggregation_type NOT IN (1,2) )   
  ) ;
