
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Put_SupervisorSignoff
--
--  Purpose:
--	Given a dxhdata_id and some way to identify Supervisor, store the initials 
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
--	20200213		C01V00 - Remove outputtable and json result
--		
-- Example Call:
-- Exec spLocal_EY_DxH_Put_SupervisorSignOff 3, '2477', Null, Null, '2019-08-09 15:08:28.220'
--
CREATE    PROCEDURE [dbo].[spLocal_EY_DxH_Put_SupervisorSignOff]
--Declare
@DxHData_Id   INT, -- the hour Id
@Clock_Number NVARCHAR(100), -- used to look up First and Last, leave blank if you have first and last
@First_Name   NVARCHAR(100), -- 
@Last_Name    NVARCHAR(100), --
@Timestamp    DATETIME		-- generally the current time
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;
        DECLARE @First NVARCHAR(50), @Last NVARCHAR(50), @Initials NVARCHAR(50), @ReturnStatus INT, @ReturnMessage NVARCHAR(1000);
        IF NOT EXISTS
        (
            SELECT dxhdata_id
            FROM dbo.DxHData WITH(NOLOCK)
            WHERE dxhdata_id = ISNULL(@DxHData_Id, -1)
        )
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid DxHData_Id ' + CONVERT(NVARCHAR, ISNULL(@DxHData_Id, ''));
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
                       @ReturnMessage = 'Invalid First Name ' + CONVERT(NVARCHAR, ISNULL(@First_Name, ''));
                GOTO ErrExit;
        END;
        IF ISNULL(@Last_Name, '') = ''
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid Last Name ' + CONVERT(NVARCHAR, ISNULL(@Last_Name, ''));
                GOTO ErrExit;
        END;
        SELECT @Initials = CONVERT(NVARCHAR, LEFT(@First_Name, 1)) + CONVERT(NVARCHAR, LEFT(@last_Name, 1));
        IF ISDATE(@Timestamp) <> 1
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid timestamp ' + CONVERT(NVARCHAR, ISNULL(@Timestamp, ''));
                GOTO ErrExit;
        END;
        UPDATE dbo.DxHData
          SET 
              supervisor_signoff = @Initials, 
              supervisor_signoff_timestamp = @Timestamp, 
              last_modified_by = @Initials, 
              last_modified_on = GETDATE()
        FROM dbo.DxHData dxh
        WHERE dxh.dxhdata_id = @DxHData_Id;
        SELECT @ReturnStatus = 0, 
               @ReturnMessage = 'Supervisor signed off ' + CONVERT(NVARCHAR, @DxHData_Id);
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
