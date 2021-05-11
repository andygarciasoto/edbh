CREATE TABLE [dbo].[EscalationEvents] (
    [escalationevent_id] INT            IDENTITY (1, 1) NOT NULL,
    [dxhdata_id]         INT            NOT NULL,
    [asset_id]           INT            NOT NULL,
    [escalation_time]    DATETIME       NOT NULL,
    [sign_time]          DATETIME       NULL,
    [badge]              NVARCHAR (100) NULL,
    [site]               INT            NULL,
    [escalation_id]      INT            NULL,
    CONSTRAINT [PK_EscalationEvents] PRIMARY KEY CLUSTERED ([escalationevent_id] ASC)
);

