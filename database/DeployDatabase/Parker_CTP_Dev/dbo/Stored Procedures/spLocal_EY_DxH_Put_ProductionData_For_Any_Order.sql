/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_ProductionData_For_Any_Order]    Script Date: 9/2/2021 13:04:19 ******/
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Put_Production_For_Any_Order
--
--  Purpose:
--	Insert Production no matter if you have a DXH row or not
--
--	Returns a status and a message
--		 0 is pass
--		-1 is fail
--	
--	To Do:
--
--  Output Parameters:
---
--  Input Parameters:
---	
--  Trigger:
---
--  Data Read Other Inputs:  
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
--  Tables Modified:
--	ProductionData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20200130		C00V00 - Intial code created		
--		
-- Example Call:
-- exec spLocal_EY_DxH_Put_ProductionData_For_Any_Order 29239, NULL, 10, '47132', Null, Null
--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Put_ProductionData_For_Any_Order]
--Declare
@DxHData_Id				INT, -- the hour Id
@ProductionData_Id      INT, -- the productionData Id
@Actual					FLOAT, -- to be inserted, increment exisiting Actual, or replace if Override
@Clock_Number			NVARCHAR(100), -- used to look up First and Last, leave blank if you have first and last
@Timestamp				DATETIME 
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;
        DECLARE
		@ReturnStatus INT,
		@ReturnMessage NVARCHAR(1000);

        IF NOT EXISTS
        (
            SELECT dxhdata_id
            FROM dbo.DxHData WITH(NOLOCK)
            WHERE dxhdata_id = ISNULL(@DxHData_Id, -1)
        )
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid DxHData_Id' + CONVERT(NVARCHAR, ISNULL(@DxHData_Id, ''));
                GOTO ErrExit;
        END;
		IF @ProductionData_Id IS NULL
		BEGIN
			exec spLocal_EY_DxH_Put_ProductionData @DxhData_Id, @Actual, 0, 0, @Clock_Number, null, null, @Timestamp, 0
			SELECT @ReturnStatus = 0, 
			@ReturnMessage = 'Inserted new production row';
		END
		ELSE
		BEGIN
	        IF NOT EXISTS
        (
            SELECT productiondata_id
            FROM dbo.ProductionData WITH(NOLOCK)
            WHERE productiondata_id = ISNULL(@ProductionData_Id, -1)
        )
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid ProductionData_Id' + CONVERT(NVARCHAR, ISNULL(@ProductionData_Id, ''));
                GOTO ErrExit;
			END;
			ELSE
			BEGIN		
		UPDATE dbo.ProductionData
                        SET 
							actual = @Actual,
							last_modified_by = @Clock_Number, 
							last_modified_on = GETDATE()
                        FROM dbo.ProductionData pd
                        WHERE pd.productiondata_id = @ProductionData_Id AND pd.dxhdata_id = @DxHData_Id;
                        SELECT @ReturnStatus = 0, 
                               @ReturnMessage = 'Override ' + CONVERT(NVARCHAR, @ProductionData_Id) + ' ' + CONVERT(NVARCHAR, @DxHData_Id);
					END
					END

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
