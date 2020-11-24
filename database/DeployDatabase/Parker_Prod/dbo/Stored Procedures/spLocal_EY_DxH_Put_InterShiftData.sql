
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Put_InterShiftData
--
--  Purpose:
--	Given a dxhdata_id and needed intershift info, store the intershift data
--
--	If the @Update field is Null or 0, then it is a new insert
--	If the @Update field is Not Null and Not 0, it is an update 
--		and the value is the intershiftdata_id to update
--
--	Returns a status and a message
--		 0 is pass
--		-1 is fail
--
--	DxHData_Id is more related to an hour but it is easy to get the needed shift info from that		
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
--	InterShiftData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190809		C00V00 - Intial code created		
--	20190818		C00V01 - Validated Timestamp and used it as entered_on for inserts		
--	20190822		C00V02 - Timestamp adjusted to UTC to be used as entered_on
--	20191204		C00V03 - Change CommonParameters to CommonParameters
--		
-- Example Call:
-- Exec spLocal_EY_DxH_Put_InterShiftData 3, 'shifting gears', '2477', Null, Null, '2019-08-09 15:08:28.220', 0
--
CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Put_InterShiftData]
--Declare
@DxHData_Id   INT, -- any hour Id of the shift associated with this data
@Comment      VARCHAR(256), -- the main info for the display
@Clock_Number VARCHAR(100), -- used to look up First and Last, leave Null if you have first and last
@First_Name   VARCHAR(100), -- Leave Null if you send Clock Number
@Last_Name    VARCHAR(100), -- Leave Null if you send Clock Number
@Timestamp    DATETIME, -- generally current time in site timezone
@Update       INT				-- generally null or 0, send the intershift_id for update
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;
        DECLARE 
		@First VARCHAR(50),
		@Last VARCHAR(50),
		@Initials VARCHAR(50),
		@InterShift_Id INT,
		@Existing_Comment VARCHAR(256),
		@ReturnStatus INT,
		@ReturnMessage VARCHAR(1000),
		@Site_Timezone VARCHAR(100),
		@Timestamp_UTC DATETIME,
		@asset_id INT,
		@Production_Day DATETIME,
		@Shift_Code VARCHAR(100),
		@Site_Id INT;

        SELECT @asset_id = asset_id, 
               @Production_Day = production_day, 
               @Shift_Code = shift_code
        FROM dbo.DxHData
        WHERE dxhdata_id = @DxHData_Id;
        SELECT @Site_Id = asset_id
        FROM [dbo].[Asset]
        WHERE asset_level = 'Site'
              AND site_code =
        (
            SELECT site_code
            FROM [dbo].[Asset]
            WHERE asset_id = @asset_id
        );
        SELECT @Site_Timezone = site_timezone
        FROM dbo.CommonParameters cpt WITH(NOLOCK)
        WHERE site_id = @Site_Id
              AND STATUS = 'Active';

        SELECT @Timestamp_UTC = @Timestamp AT TIME ZONE @Site_Timezone AT TIME ZONE 'UTC'

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
        IF ISNULL(@Comment, '') = ''
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid Comment ' + CONVERT(VARCHAR, ISNULL(@Comment, ''));
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
                       @ReturnMessage = 'Invalid Timestamp ' + CONVERT(VARCHAR, ISNULL(@Timestamp, ''));
                GOTO ErrExit;
        END;
        IF(ISNULL(@Update, 0) <> 0)
          AND (NOT EXISTS
        (
            SELECT intershift_id
            FROM dbo.InterShiftData WITH(NOLOCK)
            WHERE intershift_id = ISNULL(@Update, -1)
        ))
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid Update ' + CONVERT(VARCHAR, ISNULL(@Update, ''));
                GOTO ErrExit;
        END;
        IF ISNULL(@Update, 0) = 0
            BEGIN
                INSERT INTO dbo.InterShiftData
                VALUES
                (@Production_Day,
                 @Shift_Code,
                 @Comment,
                 @First_Name,
                 @Last_Name,
                 @Initials,
                 @Timestamp_UTC,
                 @Initials,
                 GETDATE(),
                 @asset_id
                );
                SET @InterShift_Id = SCOPE_IDENTITY();
                SELECT @ReturnStatus = 0, 
                       @ReturnMessage = 'Inserted ' + CONVERT(VARCHAR, @InterShift_Id);
        END;
            ELSE
            BEGIN
                IF EXISTS
                (
                    SELECT intershift_id
                    FROM dbo.InterShiftData WITH(NOLOCK)
                    WHERE intershift_id = ISNULL(@Update, -1)
                )
                    BEGIN
                        SELECT @Existing_Comment = comment
                        FROM dbo.InterShiftData WITH(NOLOCK)
                        WHERE intershift_id = ISNULL(@Update, -1);
                        IF ISNULL(@Existing_Comment, '') <> ISNULL(@Comment, '')
                            BEGIN
                                UPDATE dbo.InterShiftData
                                  SET 
                                      comment = @Comment, 
                                      first_name = @First_Name, 
                                      last_name = @Last_Name, 
                                      last_modified_by = @Initials, 
                                      last_modified_on = GETDATE()
                                WHERE intershift_id = @Update;
                                SELECT @ReturnStatus = 0, 
                                       @ReturnMessage = 'Updated ' + CONVERT(VARCHAR, ISNULL(@Update, ''));
                        END;
                            ELSE
                            BEGIN
                                SELECT @ReturnStatus = -1, 
                                       @ReturnMessage = 'Nothing to update ' + CONVERT(VARCHAR, ISNULL(@Update, ''));
                        END;
                END;
        END;
        ErrExit:
        IF @ReturnStatus IS NULL
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Unknown Error';
        END;
        SELECT @ReturnStatus AS ReturnStatus, 
               @ReturnMessage AS ReturnMessage;
        RETURN;
    END;

        /****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_OperatorSignOff]    Script Date: 4/12/2019 15:25:41 ******/

        SET ANSI_NULLS ON;
