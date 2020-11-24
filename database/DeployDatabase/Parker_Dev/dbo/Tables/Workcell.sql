CREATE TABLE [dbo].[Workcell] (
    [workcell_id]          INT           IDENTITY (1, 1) NOT NULL,
    [workcell_name]        VARCHAR (200) NOT NULL,
    [workcell_description] VARCHAR (256) NULL,
    [entered_by]           VARCHAR (100) NULL,
    [entered_on]           DATETIME      CONSTRAINT [DF_Workcell_entered_on] DEFAULT (getdate()) NULL,
    [last_modified_by]     VARCHAR (100) NULL,
    [last_modified_on]     DATETIME      CONSTRAINT [DF_Workcell_last_modified_on] DEFAULT (getdate()) NULL,
    CONSTRAINT [PK_Workcell] PRIMARY KEY CLUSTERED ([workcell_id] ASC)
);


GO

CREATE TRIGGER [dbo].[updateWorkcellModifiedDate]
   ON  [dbo].[Workcell]
   AFTER INSERT, UPDATE 
AS 
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

     UPDATE Workcell SET last_modified_on = CURRENT_TIMESTAMP
      FROM Workcell w
	    INNER JOIN inserted i
		  ON w.workcell_id = i.workcell_id

END
