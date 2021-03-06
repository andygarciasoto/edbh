/****** Object:  Table [dbo].[Asset]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Asset](
	[asset_id] [int] IDENTITY(1,1) NOT NULL,
	[asset_code] [varchar](100) NOT NULL,
	[asset_name] [varchar](200) NOT NULL,
	[asset_description] [varchar](256) NULL,
	[asset_level] [varchar](100) NOT NULL,
	[site_code] [varchar](100) NOT NULL,
	[parent_asset_code] [varchar](100) NOT NULL,
	[value_stream] [varchar](100) NULL,
	[automation_level] [varchar](100) NULL,
	[include_in_escalation] [bit] NULL,
	[grouping1] [varchar](256) NULL,
	[grouping2] [varchar](256) NULL,
	[grouping3] [varchar](256) NULL,
	[grouping4] [varchar](256) NULL,
	[grouping5] [varchar](256) NULL,
	[status] [varchar](50) NOT NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
 CONSTRAINT [PK_Asset_Asset_Id] PRIMARY KEY NONCLUSTERED 
(
	[asset_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AssetDisplaySystem]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AssetDisplaySystem](
	[assetdisplaysystem_id] [int] IDENTITY(1,1) NOT NULL,
	[displaysystem_name] [varchar](200) NOT NULL,
	[status] [varchar](50) NOT NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
	[asset_id] [int] NULL,
 CONSTRAINT [PK_AssetDisplaySystem_AssetDisplaySystem_Id] PRIMARY KEY NONCLUSTERED 
(
	[assetdisplaysystem_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AssetProductTarget]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AssetProductTarget](
	[assetproducttarget_id] [int] IDENTITY(1,1) NOT NULL,
	[asset_code] [varchar](100) NULL,
	[product_code] [varchar](100) NOT NULL,
	[UOM_code] [varchar](100) NOT NULL,
	[routed_cycle_time] [float] NULL,
	[minutes_allowed_per_setup] [float] NULL,
	[ideal] [float] NULL,
	[target_percent_of_ideal] [float] NULL,
	[valid_from] [datetime] NOT NULL,
	[valid_to] [datetime] NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
 CONSTRAINT [PK_AssetProductTarget_Id] PRIMARY KEY NONCLUSTERED 
(
	[assetproducttarget_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CommentData]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CommentData](
	[commentdata_id] [int] IDENTITY(1,1) NOT NULL,
	[dxhdata_id] [int] NOT NULL,
	[comment] [varchar](256) NULL,
	[first_name] [varchar](100) NULL,
	[last_name] [varchar](100) NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
 CONSTRAINT [PK_CommentData_CommentData_Id] PRIMARY KEY NONCLUSTERED 
(
	[commentdata_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CommonParameters]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CommonParameters](
	[parameter_id] [int] IDENTITY(1,1) NOT NULL,
	[site_id] [int] NOT NULL,
	[site_name] [nvarchar](100) NOT NULL,
	[production_day_offset_minutes] [float] NULL,
	[site_timezone] [nvarchar](100) NULL,
	[ui_timezone] [nvarchar](100) NULL,
	[escalation_level1_minutes] [float] NULL,
	[escalation_level2_minutes] [float] NULL,
	[default_target_percent_of_ideal] [float] NULL,
	[default_setup_minutes] [float] NULL,
	[default_routed_cycle_time] [float] NULL,
	[setup_lookback_minutes] [float] NULL,
	[inactive_timeout_minutes] [float] NULL,
	[language] [nvarchar](100) NULL,
	[status] [varchar](100) NULL,
	[entered_by] [varchar](100) NULL,
	[entered_on] [datetime] NULL,
	[last_modified_by] [varchar](100) NULL,
	[last_modified_on] [datetime] NULL,
	[summary_timeout] [int] NULL,
 CONSTRAINT [PK_CommonParameters_Parameter_Id] PRIMARY KEY NONCLUSTERED 
(
	[parameter_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DTData]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DTData](
	[dtdata_id] [int] IDENTITY(1,1) NOT NULL,
	[dxhdata_id] [int] NOT NULL,
	[dtreason_id] [int] NULL,
	[dtminutes] [float] NULL,
	[dtminutes_provisional] [float] NULL,
	[dtminutes_total] [float] NULL,
	[dtminutes_breaks] [float] NULL,
	[dtminutes_setup] [float] NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
	[name] [varchar](100) NULL,
 CONSTRAINT [PK_DTData_DTData_Id] PRIMARY KEY NONCLUSTERED 
(
	[dtdata_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DTReason]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DTReason](
	[dtreason_id] [int] IDENTITY(1,1) NOT NULL,
	[dtreason_code] [varchar](100) NOT NULL,
	[dtreason_name] [varchar](200) NOT NULL,
	[dtreason_description] [varchar](256) NULL,
	[dtreason_category] [varchar](100) NULL,
	[reason1] [varchar](100) NULL,
	[reason2] [varchar](100) NULL,
	[status] [varchar](50) NOT NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
	[asset_id] [int] NULL,
 CONSTRAINT [PK_DTReason_DTReason_Id] PRIMARY KEY NONCLUSTERED 
(
	[dtreason_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DxHData]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DxHData](
	[dxhdata_id] [int] IDENTITY(1,1) NOT NULL,
	[production_day] [datetime] NOT NULL,
	[hour_interval] [varchar](100) NOT NULL,
	[shift_code] [varchar](100) NOT NULL,
	[summary_product_code] [varchar](100) NULL,
	[summary_ideal] [float] NULL,
	[summary_target] [float] NULL,
	[summary_actual] [float] NULL,
	[summary_UOM_code] [varchar](100) NULL,
	[summary_order_number] [varchar](100) NULL,
	[summary_dtminutes] [float] NULL,
	[summary_dtreason_code] [varchar](100) NULL,
	[summary_comments] [varchar](256) NULL,
	[summary_action_taken] [varchar](256) NULL,
	[operator_signoff] [varchar](100) NULL,
	[operator_signoff_timestamp] [datetime] NULL,
	[supervisor_signoff] [varchar](100) NULL,
	[supervisor_signoff_timestamp] [datetime] NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
	[start_time] [datetime] NULL,
	[end_time] [datetime] NULL,
	[asset_id] [int] NULL,
 CONSTRAINT [PK_DxHData_DxHData_Id] PRIMARY KEY NONCLUSTERED 
(
	[dxhdata_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ExampleJTraxData$]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ExampleJTraxData$](
	[Plant] [nvarchar](255) NULL,
	[JobNumber] [nvarchar](255) NULL,
	[PartNumber] [nvarchar](255) NULL,
	[MachineNumber] [float] NULL,
	[Operation] [float] NULL,
	[CycleTime] [float] NULL,
	[JobQuantity] [float] NULL,
	[AcceptedPieces] [float] NULL,
	[RejectedPieces] [float] NULL,
	[ReleaseDate] [datetime] NULL,
	[SetupStart] [datetime] NULL,
	[SetupEnd] [datetime] NULL,
	[ElapsedSetupTime] [float] NULL,
	[FirstInspectionEvent] [datetime] NULL,
	[LastInspectionEvent] [datetime] NULL,
	[ClosedDate] [datetime] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[GlobalParameters]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GlobalParameters](
	[summary_timeout] [float] NULL,
	[inactive_timeout_minutes] [float] NULL,
	[socket_timeout] [float] NULL,
	[max_regression] [float] NULL,
	[token_expiration] [float] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[InterShiftData]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InterShiftData](
	[intershift_id] [int] IDENTITY(1,1) NOT NULL,
	[production_day] [datetime] NOT NULL,
	[shift_code] [varchar](100) NOT NULL,
	[comment] [varchar](256) NULL,
	[first_name] [varchar](100) NULL,
	[last_name] [varchar](100) NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
	[asset_id] [int] NULL,
 CONSTRAINT [PK_InterShift_InterShift_Id] PRIMARY KEY NONCLUSTERED 
(
	[intershift_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Language]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Language](
	[language_id] [int] IDENTITY(1,1) NOT NULL,
	[language_code] [varchar](100) NOT NULL,
	[language_name] [varchar](200) NOT NULL,
	[langueage_description] [varchar](256) NULL,
	[module] [varchar](100) NULL,
	[status] [varchar](50) NOT NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
 CONSTRAINT [PK_Language_Language_Id] PRIMARY KEY NONCLUSTERED 
(
	[language_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[OrderData]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OrderData](
	[order_id] [int] IDENTITY(1,1) NOT NULL,
	[order_number] [varchar](100) NOT NULL,
	[product_code] [varchar](100) NOT NULL,
	[order_quantity] [float] NULL,
	[UOM_code] [varchar](100) NULL,
	[routed_cycle_time] [float] NULL,
	[minutes_allowed_per_setup] [float] NULL,
	[ideal] [float] NULL,
	[target_percent_of_ideal] [float] NULL,
	[production_status] [varchar](100) NOT NULL,
	[setup_start_time] [datetime] NULL,
	[setup_end_time] [datetime] NULL,
	[production_start_time] [datetime] NULL,
	[production_end_time] [datetime] NULL,
	[start_time] [datetime] NOT NULL,
	[end_time] [datetime] NULL,
	[is_current_order] [bit] NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
	[asset_id] [int] NULL,
	[cumulative_actual] [float] NULL,
 CONSTRAINT [PK_OrderData_Order_Id] PRIMARY KEY NONCLUSTERED 
(
	[order_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Product]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Product](
	[product_id] [int] IDENTITY(1,1) NOT NULL,
	[product_code] [varchar](100) NOT NULL,
	[product_name] [varchar](200) NOT NULL,
	[product_description] [varchar](256) NULL,
	[product_family] [varchar](100) NULL,
	[value_stream] [varchar](100) NULL,
	[grouping1] [varchar](256) NULL,
	[grouping2] [varchar](256) NULL,
	[grouping3] [varchar](256) NULL,
	[grouping4] [varchar](256) NULL,
	[grouping5] [varchar](256) NULL,
	[status] [varchar](50) NOT NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
	[asset_id] [int] NULL,
 CONSTRAINT [PK_Product_Product_Id] PRIMARY KEY NONCLUSTERED 
(
	[product_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProductionData]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductionData](
	[productiondata_id] [int] IDENTITY(1,1) NOT NULL,
	[dxhdata_id] [int] NOT NULL,
	[product_code] [varchar](100) NOT NULL,
	[ideal] [float] NULL,
	[target] [float] NULL,
	[actual] [float] NULL,
	[UOM_code] [varchar](100) NULL,
	[order_id] [int] NULL,
	[order_number] [varchar](100) NULL,
	[start_time] [datetime] NULL,
	[end_time] [datetime] NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
	[setup_scrap] [float] NULL,
	[other_scrap] [float] NULL,
	[name] [varchar](100) NULL,
 CONSTRAINT [PK_ProductionData_ProductionData_Id] PRIMARY KEY NONCLUSTERED 
(
	[productiondata_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProductionData_History]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductionData_History](
	[productiondatahistory_id] [int] IDENTITY(1,1) NOT NULL,
	[productiondata_id] [int] NULL,
	[dxhdata_id] [int] NULL,
	[product_code] [varchar](100) NULL,
	[ideal] [float] NULL,
	[target] [float] NULL,
	[actual] [float] NULL,
	[UOM_code] [varchar](100) NULL,
	[order_id] [int] NULL,
	[order_number] [varchar](100) NULL,
	[start_time] [datetime] NULL,
	[end_time] [datetime] NULL,
	[entered_by] [varchar](100) NULL,
	[entered_on] [datetime] NULL,
	[last_modified_by] [varchar](100) NULL,
	[last_modified_on] [datetime] NULL,
	[history_entered_by] [varchar](100) NULL,
	[history_entered_on] [datetime] NULL,
	[history_entered_on_UTC] [datetime] NULL,
 CONSTRAINT [PK_ProductionDataHistory_ProductionDataHistory_Id] PRIMARY KEY NONCLUSTERED 
(
	[productiondatahistory_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Shift]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Shift](
	[shift_id] [int] IDENTITY(1,1) NOT NULL,
	[shift_code] [varchar](100) NOT NULL,
	[shift_name] [varchar](200) NOT NULL,
	[shift_description] [varchar](256) NULL,
	[shift_sequence] [int] NULL,
	[start_time] [time](0) NOT NULL,
	[end_time] [time](0) NOT NULL,
	[duration_in_minutes] [int] NOT NULL,
	[valid_from] [datetime] NOT NULL,
	[valid_to] [datetime] NULL,
	[team_code] [varchar](100) NULL,
	[is_first_shift_of_day] [bit] NOT NULL,
	[status] [varchar](50) NOT NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
	[asset_id] [int] NULL,
 CONSTRAINT [PK_Shift_Shift_Id] PRIMARY KEY NONCLUSTERED 
(
	[shift_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SupervisorAsset]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SupervisorAsset](
	[supervisorasset_id] [int] IDENTITY(1,1) NOT NULL,
	[supervisor] [varchar](100) NOT NULL,
	[shift_code] [varchar](100) NOT NULL,
	[valid_from] [datetime] NOT NULL,
	[valid_to] [datetime] NULL,
	[status] [varchar](50) NOT NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
	[asset_id] [int] NULL,
 CONSTRAINT [PK_SupervisorAsset_Id] PRIMARY KEY NONCLUSTERED 
(
	[supervisorasset_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[sysdiagrams]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[sysdiagrams](
	[name] [sysname] NOT NULL,
	[principal_id] [int] NOT NULL,
	[diagram_id] [int] IDENTITY(1,1) NOT NULL,
	[version] [int] NULL,
	[definition] [varbinary](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[diagram_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UK_principal_name] UNIQUE NONCLUSTERED 
(
	[principal_id] ASC,
	[name] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Tag]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tag](
	[tag_id] [int] IDENTITY(1,1) NOT NULL,
	[tag_code] [varchar](100) NOT NULL,
	[tag_name] [varchar](200) NOT NULL,
	[tag_description] [varchar](256) NULL,
	[tag_group] [varchar](100) NULL,
	[datatype] [varchar](100) NULL,
	[tag_type] [varchar](100) NULL,
	[UOM_code] [varchar](100) NULL,
	[rollover_point] [float] NULL,
	[aggregation] [varchar](100) NULL,
	[status] [varchar](50) NOT NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
	[site_id] [int] NOT NULL,
	[asset_id] [int] NULL,
	[max_change] [int] NULL,
 CONSTRAINT [PK_Tag_Tag_Id] PRIMARY KEY NONCLUSTERED 
(
	[tag_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TagData]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TagData](
	[tagdata_id] [int] IDENTITY(1,1) NOT NULL,
	[tag_name] [varchar](200) NOT NULL,
	[tagdata_value] [varchar](256) NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
	[timestamp] [datetime] NULL,
 CONSTRAINT [PK_TagData_TagData_Id] PRIMARY KEY NONCLUSTERED 
(
	[tagdata_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TFDUsers]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TFDUsers](
	[Badge] [varchar](50) NULL,
	[Username] [varchar](50) NULL,
	[First_Name] [varchar](50) NULL,
	[Last_Name] [varchar](50) NULL,
	[Role] [varchar](100) NULL,
	[Site] [int] NULL,
	[ID] [int] IDENTITY(1,1) NOT NULL,
 CONSTRAINT [PK_TFDUSERS_01] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Translation]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Translation](
	[translation_id] [int] IDENTITY(1,1) NOT NULL,
	[label_code] [varchar](100) NOT NULL,
	[label_name] [varchar](200) NOT NULL,
	[label_description] [varchar](256) NULL,
	[language_code] [varchar](100) NULL,
	[translated_label_code] [varchar](100) NULL,
	[translated_label_name] [varchar](200) NULL,
	[translated_label_description] [varchar](256) NULL,
	[module] [varchar](100) NULL,
	[status] [varchar](50) NOT NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
 CONSTRAINT [PK_Translation_Translation_Id] PRIMARY KEY NONCLUSTERED 
(
	[translation_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Unavailable]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Unavailable](
	[unavailable_id] [int] IDENTITY(1,1) NOT NULL,
	[unavailable_code] [varchar](100) NOT NULL,
	[unavailable_name] [varchar](200) NOT NULL,
	[unavailable_description] [varchar](256) NULL,
	[start_time] [time](0) NOT NULL,
	[end_time] [time](0) NOT NULL,
	[duration_in_minutes] [int] NOT NULL,
	[valid_from] [datetime] NOT NULL,
	[valid_to] [datetime] NULL,
	[status] [varchar](50) NOT NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
	[site_id] [int] NOT NULL,
	[asset_id] [int] NULL,
 CONSTRAINT [PK_Unavailable_Unavailable_Id] PRIMARY KEY NONCLUSTERED 
(
	[unavailable_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UOM]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UOM](
	[UOM_id] [int] IDENTITY(1,1) NOT NULL,
	[UOM_code] [varchar](100) NOT NULL,
	[UOM_name] [varchar](200) NOT NULL,
	[UOM_description] [varchar](256) NULL,
	[status] [varchar](50) NOT NULL,
	[entered_by] [varchar](100) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](100) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
	[site_id] [int] NOT NULL,
	[decimals] [bit] NULL,
 CONSTRAINT [PK_UOM_UOM_Id] PRIMARY KEY NONCLUSTERED 
(
	[UOM_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Workcell]    Script Date: 20/2/2020 11:31:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Workcell](
	[workcell_id] [int] IDENTITY(1,1) NOT NULL,
	[workcell_name] [varchar](200) NOT NULL,
	[workcell_description] [varchar](256) NULL,
	[entered_by] [varchar](100) NULL,
	[entered_on] [datetime] NULL,
	[last_modified_by] [varchar](100) NULL,
	[last_modified_on] [datetime] NULL,
	[displaysystem_name] [varchar](100) NULL,
 CONSTRAINT [PK_Workcell] PRIMARY KEY CLUSTERED 
(
	[workcell_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[AssetDisplaySystem] ADD  CONSTRAINT [DF_AssetDisplaySystem_status]  DEFAULT ('Active') FOR [status]
GO
ALTER TABLE [dbo].[AssetDisplaySystem] ADD  CONSTRAINT [DF_AssetDisplaySystem_entered_by]  DEFAULT ('Unknown') FOR [entered_by]
GO
ALTER TABLE [dbo].[AssetDisplaySystem] ADD  CONSTRAINT [DF_AssetDisplaySystem_entered_on]  DEFAULT (getdate()) FOR [entered_on]
GO
ALTER TABLE [dbo].[AssetDisplaySystem] ADD  CONSTRAINT [DF_AssetDisplaySystem_last_modified_by]  DEFAULT ('Unknown') FOR [last_modified_by]
GO
ALTER TABLE [dbo].[AssetDisplaySystem] ADD  CONSTRAINT [DF_AssetDisplaySystem_last_modified_on]  DEFAULT (getdate()) FOR [last_modified_on]
GO
ALTER TABLE [dbo].[Tag] ADD  DEFAULT ((1)) FOR [site_id]
GO
ALTER TABLE [dbo].[Unavailable] ADD  DEFAULT ((1)) FOR [site_id]
GO
ALTER TABLE [dbo].[UOM] ADD  DEFAULT ((1)) FOR [site_id]
GO
ALTER TABLE [dbo].[Workcell] ADD  CONSTRAINT [DF_Workcell_entered_on]  DEFAULT (getdate()) FOR [entered_on]
GO
ALTER TABLE [dbo].[Workcell] ADD  CONSTRAINT [DF_Workcell_last_modified_on]  DEFAULT (getdate()) FOR [last_modified_on]
GO
ALTER TABLE [dbo].[AssetDisplaySystem]  WITH CHECK ADD  CONSTRAINT [FK_ADS_Asset_Id] FOREIGN KEY([asset_id])
REFERENCES [dbo].[Asset] ([asset_id])
GO
ALTER TABLE [dbo].[AssetDisplaySystem] CHECK CONSTRAINT [FK_ADS_Asset_Id]
GO
ALTER TABLE [dbo].[AssetProductTarget]  WITH CHECK ADD  CONSTRAINT [FK_APT_Asset_Code] FOREIGN KEY([asset_code])
REFERENCES [dbo].[Asset] ([asset_code])
GO
ALTER TABLE [dbo].[AssetProductTarget] CHECK CONSTRAINT [FK_APT_Asset_Code]
GO
ALTER TABLE [dbo].[AssetProductTarget]  WITH CHECK ADD  CONSTRAINT [FK_APT_Product_Code] FOREIGN KEY([product_code])
REFERENCES [dbo].[Product] ([product_code])
GO
ALTER TABLE [dbo].[AssetProductTarget] CHECK CONSTRAINT [FK_APT_Product_Code]
GO
ALTER TABLE [dbo].[AssetProductTarget]  WITH CHECK ADD  CONSTRAINT [FK_APT_UOM_Code] FOREIGN KEY([UOM_code])
REFERENCES [dbo].[UOM] ([UOM_code])
GO
ALTER TABLE [dbo].[AssetProductTarget] CHECK CONSTRAINT [FK_APT_UOM_Code]
GO
ALTER TABLE [dbo].[CommentData]  WITH CHECK ADD  CONSTRAINT [FK_CommentData_DxHData_ID] FOREIGN KEY([dxhdata_id])
REFERENCES [dbo].[DxHData] ([dxhdata_id])
GO
ALTER TABLE [dbo].[CommentData] CHECK CONSTRAINT [FK_CommentData_DxHData_ID]
GO
ALTER TABLE [dbo].[CommonParameters]  WITH CHECK ADD  CONSTRAINT [FK_CommonParameters_Site_Id] FOREIGN KEY([site_id])
REFERENCES [dbo].[Asset] ([asset_id])
GO
ALTER TABLE [dbo].[CommonParameters] CHECK CONSTRAINT [FK_CommonParameters_Site_Id]
GO
ALTER TABLE [dbo].[DTData]  WITH CHECK ADD  CONSTRAINT [FK_DTData_DTReason_ID] FOREIGN KEY([dtreason_id])
REFERENCES [dbo].[DTReason] ([dtreason_id])
GO
ALTER TABLE [dbo].[DTData] CHECK CONSTRAINT [FK_DTData_DTReason_ID]
GO
ALTER TABLE [dbo].[DTData]  WITH CHECK ADD  CONSTRAINT [FK_DTData_DxHData_ID] FOREIGN KEY([dxhdata_id])
REFERENCES [dbo].[DxHData] ([dxhdata_id])
GO
ALTER TABLE [dbo].[DTData] CHECK CONSTRAINT [FK_DTData_DxHData_ID]
GO
ALTER TABLE [dbo].[DTReason]  WITH CHECK ADD  CONSTRAINT [FK_DTReason_Asset_Id] FOREIGN KEY([asset_id])
REFERENCES [dbo].[Asset] ([asset_id])
GO
ALTER TABLE [dbo].[DTReason] CHECK CONSTRAINT [FK_DTReason_Asset_Id]
GO
ALTER TABLE [dbo].[DxHData]  WITH CHECK ADD  CONSTRAINT [FK_DxHData_Asset_Id] FOREIGN KEY([asset_id])
REFERENCES [dbo].[Asset] ([asset_id])
GO
ALTER TABLE [dbo].[DxHData] CHECK CONSTRAINT [FK_DxHData_Asset_Id]
GO
ALTER TABLE [dbo].[DxHData]  WITH CHECK ADD  CONSTRAINT [FK_DxHData_Shift_Code] FOREIGN KEY([shift_code])
REFERENCES [dbo].[Shift] ([shift_code])
GO
ALTER TABLE [dbo].[DxHData] CHECK CONSTRAINT [FK_DxHData_Shift_Code]
GO
ALTER TABLE [dbo].[InterShiftData]  WITH CHECK ADD  CONSTRAINT [FK_InterShiftData_Asset_Id] FOREIGN KEY([asset_id])
REFERENCES [dbo].[Asset] ([asset_id])
GO
ALTER TABLE [dbo].[InterShiftData] CHECK CONSTRAINT [FK_InterShiftData_Asset_Id]
GO
ALTER TABLE [dbo].[InterShiftData]  WITH CHECK ADD  CONSTRAINT [FK_InterShiftData_Shift_Code] FOREIGN KEY([shift_code])
REFERENCES [dbo].[Shift] ([shift_code])
GO
ALTER TABLE [dbo].[InterShiftData] CHECK CONSTRAINT [FK_InterShiftData_Shift_Code]
GO
ALTER TABLE [dbo].[ProductionData]  WITH CHECK ADD  CONSTRAINT [FK_ProductionData_DxHData_ID] FOREIGN KEY([dxhdata_id])
REFERENCES [dbo].[DxHData] ([dxhdata_id])
GO
ALTER TABLE [dbo].[ProductionData] CHECK CONSTRAINT [FK_ProductionData_DxHData_ID]
GO
ALTER TABLE [dbo].[ProductionData]  WITH CHECK ADD  CONSTRAINT [FK_ProductionData_Product_Code] FOREIGN KEY([product_code])
REFERENCES [dbo].[Product] ([product_code])
GO
ALTER TABLE [dbo].[ProductionData] CHECK CONSTRAINT [FK_ProductionData_Product_Code]
GO
ALTER TABLE [dbo].[ProductionData]  WITH CHECK ADD  CONSTRAINT [FK_ProductionData_UOM_Code] FOREIGN KEY([UOM_code])
REFERENCES [dbo].[UOM] ([UOM_code])
GO
ALTER TABLE [dbo].[ProductionData] CHECK CONSTRAINT [FK_ProductionData_UOM_Code]
GO
ALTER TABLE [dbo].[SupervisorAsset]  WITH CHECK ADD FOREIGN KEY([asset_id])
REFERENCES [dbo].[Asset] ([asset_id])
GO
ALTER TABLE [dbo].[Tag]  WITH CHECK ADD  CONSTRAINT [FK_Tag_Asset_Id] FOREIGN KEY([asset_id])
REFERENCES [dbo].[Asset] ([asset_id])
GO
ALTER TABLE [dbo].[Tag] CHECK CONSTRAINT [FK_Tag_Asset_Id]
GO
ALTER TABLE [dbo].[Tag]  WITH CHECK ADD  CONSTRAINT [FK_Tag_UOM_Code] FOREIGN KEY([UOM_code])
REFERENCES [dbo].[UOM] ([UOM_code])
GO
ALTER TABLE [dbo].[Tag] CHECK CONSTRAINT [FK_Tag_UOM_Code]
GO
ALTER TABLE [dbo].[TagData]  WITH CHECK ADD  CONSTRAINT [FK_TagData_Tag_Name] FOREIGN KEY([tag_name])
REFERENCES [dbo].[Tag] ([tag_name])
GO
ALTER TABLE [dbo].[TagData] CHECK CONSTRAINT [FK_TagData_Tag_Name]
GO
ALTER TABLE [dbo].[TFDUsers]  WITH CHECK ADD  CONSTRAINT [FK_TFDUsers_Asset] FOREIGN KEY([Site])
REFERENCES [dbo].[Asset] ([asset_id])
GO
ALTER TABLE [dbo].[TFDUsers] CHECK CONSTRAINT [FK_TFDUsers_Asset]
GO
ALTER TABLE [dbo].[Unavailable]  WITH CHECK ADD  CONSTRAINT [FK_Unavailable_Asset_Id] FOREIGN KEY([asset_id])
REFERENCES [dbo].[Asset] ([asset_id])
GO
ALTER TABLE [dbo].[Unavailable] CHECK CONSTRAINT [FK_Unavailable_Asset_Id]
GO
