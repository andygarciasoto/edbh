--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Put_Scrap_ProductionData
--
--  Purpose:
--	Given a dxhdata_id and needed production info, update scrap data of specific production
--
--	Returns a status and a message
--		 0 is pass
--		-1 is fail
--	
--	The first production insert in an hour for each order is where the ideal and target 
--	are calculated. Any data sent for the same order in that hour will just increment the actual.
--	
--	To Do:
--
--  Output Parameters:
---
--  Input Parameters:
---
---	
--  Trigger:
---
--  Data Read Other Inputs:  
--- 
---	
--  Data Written Results:
---
--  Assumptions:
--- 
--  Dependencies: 
---	None
---
--  Variables:
---
---
--  Tables Modified:
--	ProductionData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20200130		C00V00 - Intial code created		
--		
-- Example Call:
-- exec spLocal_EY_DxH_Put_Scrap_ProductionData 29239, 387380, 10, 8, 34, '47132', Null, Null
--
CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Put_Scrap_ProductionData]
--Declare
@DxHData_Id				INT, -- the hour Id
@ProductionData_Id      INT, -- the productionData Id
@Setup_Scrap			FLOAT, -- to be inserted, increment exisiting Actual, or replace if Override
@Other_Scrap			FLOAT, -- to be inserted, increment exisiting Actual, or replace if Override
@Clock_Number			VARCHAR(100), -- used to look up First and Last, leave blank if you have first and last
@First_Name				VARCHAR(100), -- 
@Last_Name				VARCHAR(100) -- 
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;
        DECLARE @First VARCHAR(50),
		@Last VARCHAR(50),
		@Initials VARCHAR(50),
		@ReturnStatus INT,
		@ReturnMessage VARCHAR(1000);

        IF NOT EXISTS
        (
            SELECT dxhdata_id, productiondata_id
            FROM dbo.ProductionData WITH(NOLOCK)
            WHERE dxhdata_id = ISNULL(@DxHData_Id, -1) AND productiondata_id = ISNULL(@ProductionData_Id, -1)
        )
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid DxHData_Id or ProductionData_Id ' + CONVERT(VARCHAR, ISNULL(@DxHData_Id, '')) + ' or ' +  CONVERT(VARCHAR, ISNULL(@ProductionData_Id, ''));
                GOTO ErrExit;
        END;
        IF ISNULL(@Setup_Scrap, -1) < 0
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid Setup Scrap ' + CONVERT(VARCHAR, ISNULL(@Setup_Scrap, -1));
                GOTO ErrExit;
        END;
        IF ISNULL(@Other_Scrap, -1) < 0
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid Other Scrap' + CONVERT(VARCHAR, ISNULL(@Other_Scrap, -1));
                GOTO ErrExit;
        END;
        IF EXISTS
        (
            SELECT Badge
            FROM dbo.TFDUsers WITH(NOLOCK)
            WHERE Badge = ISNULL(@Clock_Number, -1)
        )
            BEGIN
                SELECT @First = First_Name, 
                       @Last = Last_Name
                FROM dbo.TFDUsers WITH(NOLOCK)
                WHERE Badge = @Clock_Number;
                IF ISNULL(@First_Name, '') = ''
                    BEGIN
                        SET @First_Name = @First;
                END;
                IF ISNULL(@Last_Name, '') = ''
                    BEGIN
                        SET @Last_Name = @Last;
                END;
        END;
        IF ISNULL(@First_Name, '') = ''
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid First Name ' + CONVERT(VARCHAR, ISNULL(@First_Name, ''));
                GOTO ErrExit;
        END;
        IF ISNULL(@Last_Name, '') = ''
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid Last Name ' + CONVERT(VARCHAR, ISNULL(@Last_Name, ''));
                GOTO ErrExit;
        END;
        SELECT @Initials = CONVERT(VARCHAR, LEFT(@First_Name, 1)) + CONVERT(VARCHAR, LEFT(@last_Name, 1));
		
		UPDATE dbo.ProductionData
                          SET 
                              setup_scrap = @Setup_Scrap, 
                              other_scrap = @Other_Scrap,
                              last_modified_by = @Initials, 
                              last_modified_on = GETDATE()
                        FROM dbo.ProductionData pd
                        WHERE pd.productiondata_id = @ProductionData_Id AND pd.dxhdata_id = @DxHData_Id;
                        SELECT @ReturnStatus = 0, 
                               @ReturnMessage = 'Override ' + CONVERT(VARCHAR, @ProductionData_Id) + ' ' + CONVERT(VARCHAR, @DxHData_Id);

        ErrExit:
        IF @ReturnStatus IS NULL
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Unknown Error';
        END;
        SELECT @ReturnStatus as ReturnStatus, 
               @ReturnMessage as ReturnMessage;
        RETURN;
    END;
