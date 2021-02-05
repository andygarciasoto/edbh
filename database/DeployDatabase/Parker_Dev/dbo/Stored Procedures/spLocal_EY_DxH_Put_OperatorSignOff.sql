
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Put_OperatorSignoff
--
--  Purpose:
--	Given a dxhdata_id and some way to identify operator, store the initials 
--
--	Returns a status and a message
--		 0 is pass
--		-1 is fail
--		
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
--	DxHData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190809		C00V00 - Intial code created
--	20200213		C01V00 - Remove output table and json return result format
--		
-- Example Call:
-- Exec spLocal_EY_DxH_Put_OperatorSignOff 3, '3276', Null, Null, '2019-08-09 15:08:28.220'
--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Put_OperatorSignOff]
--Declare
@DxHData_Id   INT, -- the hour Id
@Clock_Number VARCHAR(100), -- used to look up First and Last, leave blank if you have first and last
@First_Name   VARCHAR(100), -- 
@Last_Name    VARCHAR(100), --
@Timestamp    DATETIME		-- generally the current time
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;
        DECLARE @First VARCHAR(50), @Last VARCHAR(50), @Initials VARCHAR(50), @ReturnStatus INT, @ReturnMessage VARCHAR(1000);
        IF NOT EXISTS
        (
            SELECT dxhdata_id
            FROM dbo.DxHData WITH(NOLOCK)
            WHERE dxhdata_id = ISNULL(@DxHData_Id, -1)
        )
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid DxHData_Id ' + CONVERT(VARCHAR, ISNULL(@DxHData_Id, ''));
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
        IF ISDATE(@Timestamp) <> 1
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid timestamp ' + CONVERT(VARCHAR, ISNULL(@Timestamp, ''));
                GOTO ErrExit;
        END;

        UPDATE dbo.DxHData
          SET 
              operator_signoff = @Initials, 
              operator_signoff_timestamp = @Timestamp, 
              last_modified_by = @Initials, 
              last_modified_on = GETDATE()
        FROM dbo.DxHData dxh
        WHERE dxh.dxhdata_id = @DxHData_Id;
        SELECT @ReturnStatus = 0, 
               @ReturnMessage = 'Operator signed off ' + CONVERT(VARCHAR, @DxHData_Id);
        ErrExit:
        IF @ReturnStatus IS NULL
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Unknown Error';
        END;
        SELECT @ReturnStatus AS ReturnStatus, 
               @ReturnMessage AS Message;
        RETURN;
    END;