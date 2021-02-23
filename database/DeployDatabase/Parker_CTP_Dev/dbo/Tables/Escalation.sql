CREATE TABLE [dbo].[Escalation]
(
	[escalation_id] INT IDENTITY (1, 1) NOT NULL PRIMARY KEY, 
    [escalation_name] NVARCHAR(100) NOT NULL, 
    [escalation_group] NVARCHAR(100) NOT NULL, 
    [escalation_level] INT NOT NULL, 
    [escalation_hours] INT NULL, 
    [status] NVARCHAR(50) NOT NULL, 
    [entered_by] NVARCHAR(50) NOT NULL DEFAULT 'SQL Manual Entry', 
    [entered_on] DATETIME NOT NULL DEFAULT GETDATE(), 
    [last_modified_by] NVARCHAR(50) NOT NULL DEFAULT 'SQL Manual Entry', 
    [last_modified_on] NVARCHAR(50) NOT NULL DEFAULT GETDATE()
)
