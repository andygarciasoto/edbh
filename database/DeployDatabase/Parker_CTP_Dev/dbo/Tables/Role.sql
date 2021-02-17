CREATE TABLE [dbo].[Role] (
    [role_id]          INT            IDENTITY (1, 1) NOT NULL,
    [name]             NVARCHAR (100) NOT NULL,
    [description]      NVARCHAR (100) NULL,
    [default_view]     NVARCHAR (100) NULL,
    [status]           NVARCHAR (50)  NOT NULL,
    [entered_by]       NVARCHAR (100) NOT NULL,
    [entered_on]       DATETIME       NOT NULL,
    [last_modified_by] NVARCHAR (100) NOT NULL,
    [last_modified_on] DATETIME       NOT NULL,
    CONSTRAINT [PK_Role_Role_Id] PRIMARY KEY CLUSTERED ([role_id] ASC)
);

