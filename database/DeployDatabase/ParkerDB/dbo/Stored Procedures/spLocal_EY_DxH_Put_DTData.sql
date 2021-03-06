/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_DTData]    Script Date: 11/2/2021 11:46:22 ******/

--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights 
-- spLocal_EY_DxH_Put_DTData
--
--  Purpose:
--	Given a dxhdata_id and downtime info, store the DTData 
--
--	Note that this does some data validation
--		Minutes must not be negative
--		Minutes must not be greater than 60
-- 
--	This code DOES NOT manage the total minutes
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
--	DTData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190814		C00V00 - Intial code created		
--	20190820		C00V01 - Timestamp used as entered_on for inserts		
--	20190822		C00V02 - Timestamp adjusted to UTC to be used as entered_on 
--	20191204		C00V03 - Change CommonParameters to CommonParameters
--	20200225		C00V04 - Change out result for noraml variables, remove JSON response
--		
-- Example Call:
-- Exec spLocal_EY_DxH_Put_DTData 437106, 44188, 8109, null, 3, 'Crimper 1', 'EYAdministrator', Null, Null, '2020-08-28 14:44:50.930', 0
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Put_DTData]
--Declare
@DxHData_Id   INT, -- the hour Id
@productiondata_id INT,
@DTReason_Id  INT, 
@DTMinutes    FLOAT, 
@Quantity	  FLOAT,
@Responsible  NVARCHAR(100),
@Clock_Number NVARCHAR(100), -- used to look up First and Last, leave Null if you have first and last
@First_Name   NVARCHAR(100), -- Leave Null if you send Clock Number
@Last_Name    NVARCHAR(100), -- Leave Null if you send Clock Number
@Timestamp    DATETIME, -- generally the current time in site timezone
@Update       INT				-- generally Null or 0, send dtdata_id to update

AS

    --Select @DxHData_Id = 3,
    --	@DTReason_Id = 4, 
    --	@DTMinutes = 5,
    --	@Clock_Number = '3276',
    --	@Timestamp = getdate()

    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;
        DECLARE
		@First NVARCHAR(50),
		@Last NVARCHAR(50),
		@Initials NVARCHAR(50),
		@ReturnStatus INT,
		@ReturnMessage NVARCHAR(1000),
		@DTData_Id INT,
		@Existing_DTReason_Id INT,
		@Existing_DTMinutes FLOAT,
		@Existing_Quantity FLOAT,
        @Existing_Responsible NVARCHAR(100),
		@Site_Timezone NVARCHAR(100),
		@Timestamp_UTC DATETIME,
		@asset_id INT,
		@Site_Id INT;
        
		SET @asset_id =
        (
            SELECT asset_id
            FROM dbo.DxHData
            WHERE dxhdata_id = @DxHData_Id
        );
        SELECT @Site_Id = asset_id
        FROM [dbo].[Asset]
        WHERE asset_level = 'Site'
              AND site_code =
        (
            SELECT site_code
            FROM [dbo].[Asset]
            WHERE asset_id = @asset_id
        );
        SELECT @Site_Timezone = T.sql_timezone
        FROM dbo.CommonParameters CP INNER JOIN dbo.Timezone T 
		ON T.timezone_id = CP.timezone_id
        AND site_id = @Site_Id
        AND CP.status = 'Active';

		Select @Timestamp_UTC = @Timestamp at time zone @Site_Timezone at time zone 'UTC';

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
        IF NOT EXISTS
        (
            SELECT dr.dtreason_id
            FROM dbo.DTReason dr WITH(NOLOCK), 
                 dbo.DxHData dxh WITH(NOLOCK)
            WHERE dxh.dxhdata_id = @DxHData_Id
                  AND (dxh.asset_id = dr.asset_id OR @Site_Id = dr.asset_id)
                  AND dr.dtreason_id = ISNULL(@DTReason_Id, -1)
        )
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid DTReason_Id ' + CONVERT(NVARCHAR, ISNULL(@DTReason_Id, ''));
                GOTO ErrExit;
        END;
        IF(@DTMinutes < 0
           OR @DTMinutes > 60.0)
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid DTMinutes ' + CONVERT(NVARCHAR, ISNULL(@DTMinutes, ''));
                GOTO ErrExit;
        END;
        IF(@Quantity < 0)
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid Quantity ' + CONVERT(NVARCHAR, ISNULL(@Quantity, ''));
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
        IF(ISNULL(@Update, 0) <> 0)
          AND (NOT EXISTS
        (
            SELECT dtdata_id
            FROM dbo.DTData WITH(NOLOCK)
            WHERE dtdata_id = ISNULL(@Update, -1)
        ))
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid Update ' + CONVERT(NVARCHAR, ISNULL(@Update, ''));
                GOTO ErrExit;
        END;
        IF ISNULL(@Update, 0) = 0
            BEGIN
                INSERT INTO dbo.DTData
                (dxhdata_id, 
                 dtreason_id, 
                 dtminutes, 
				 quantity,
				 productiondata_id,
                 entered_by, 
                 entered_on, 
                 last_modified_by, 
                 last_modified_on, 
                 name,
				 responsible
                )
                       SELECT @DxHData_Id, 
                              @DTReason_Id, 
                              @DTMinutes, 
							  @Quantity,
							  @productiondata_id,
                              @Initials, 
                              @Timestamp_UTC, 
                              @Initials, 
                              GETDATE(), 
                              @First_Name + ' ' + @Last_Name,
							  @Responsible;
                SET @DTData_Id = SCOPE_IDENTITY();
                SELECT @ReturnStatus = 0, 
                       @ReturnMessage = 'Inserted ' + CONVERT(NVARCHAR, @DTData_Id);
        END;
            ELSE
            BEGIN
                IF EXISTS
                (
                    SELECT dtdata_id
                    FROM dbo.DTData WITH(NOLOCK)
                    WHERE dtdata_id = ISNULL(@Update, -1)
                )
                    BEGIN
                        SELECT @Existing_DTReason_Id = dtreason_id, 
                               @Existing_DTMinutes = dtminutes,
							   @Existing_Quantity = quantity,
                               @Existing_Responsible = responsible
                        FROM dbo.DTData WITH(NOLOCK)
                        WHERE dtdata_id = ISNULL(@Update, -1);
                        IF(ISNULL(@Existing_DTReason_Id, -1) <> ISNULL(@DTReason_Id, -1)
                           OR ISNULL(@Existing_DTMinutes, -1) <> ISNULL(@DTMinutes, -1)
						   OR ISNULL(@Existing_Quantity, -1) <> ISNULL(@Quantity, -1)
                           OR ISNULL(@Existing_Responsible, -1) <> ISNULL(@Responsible, -1))
                            BEGIN
                                UPDATE dbo.DTData
                                  SET 
                                      dtreason_id = @DTReason_Id, 
                                      dtminutes = @DTMinutes, 
									  quantity = @Quantity,
                                      last_modified_by = @Initials, 
                                      last_modified_on = GETDATE(), 
                                      name = @First_Name + ' ' + @Last_Name,
									  responsible = @Responsible
                                WHERE dtdata_id = @Update;
                                SELECT @ReturnStatus = 0, 
                                       @ReturnMessage = 'Updated ' + CONVERT(NVARCHAR, ISNULL(@Update, ''));
                        END;
                            ELSE
                            BEGIN
                                SELECT @ReturnStatus = 0, 
                                       @ReturnMessage = 'Nothing to update ' + CONVERT(NVARCHAR, ISNULL(@Update, ''));
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
