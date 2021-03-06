; 脚本由 Inno Setup 脚本向导 生成！
; 有关创建 Inno Setup 脚本文件的详细资料请查阅帮助文档！

#define MyAppName "LiveGame_windows Beta"
#define MyInstanceName "LiveGame_windows"
#define MyAppVersion "1.1.9 Beta"
#define MyAppPublisher "cocos creater"
#define MyAppURL "http://www.cocos.com/"
#define MyAppExeName "liveGame_Windows.exe"

[Setup]
; 注: AppId的值为单独标识该应用程序。
; 不要为其他安装程序使用相同的AppId值。
; (若要生成新的 GUID，可在菜单中点击 "工具|生成 GUID"。)
AppId={{E6F5B888-BF4E-457D-9271-BCF5A02DECDA}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName=C:\Program Files (x86)\{#MyAppName}
DisableDirPage=no
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
DisableProgramGroupPage=no
; [Icons] 的“quicklaunchicon”条目使用 {userappdata}，而其 [Tasks] 条目具有适合 IsAdminInstallMode 的检查。
UsedUserAreasWarning=no
LicenseFile=F:\PROJECT\liveGame_Windows\BetaXuke.txt
InfoBeforeFile=F:\PROJECT\liveGame_Windows\BetaReadme.txt
InfoAfterFile=F:\PROJECT\liveGame_Windows\BetaInstalled.txt
; 移除以下行，以在管理安装模式下运行（为所有用户安装）。
PrivilegesRequired=lowest
OutputDir=F:\PROJECT\liveGame_Windows\innoBuild
OutputBaseFilename=LiveGamePC_{#MyAppVersion}_setup
SetupIconFile=F:\PROJECT\liveGame_Windows\innoBuild\installed.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern
[code]
function GetbatFileName: string;
var
  location: String;
begin
      Result := 'C:\Users\'+GetUserNameString()+'\Desktop\关闭直播PC端.bat';
end;

function deleteCache():Boolean;
var userName: String;
      deleteDir: String;
begin
      Result := True;
      userName := GetUserNameString();
      deleteDir :=  'C:\Users\'+userName;
      deleteDir := deleteDir+'\AppData\Local\{#MyInstanceName}';
      if DirExists(deleteDir) then
        DelTree(deleteDir, True, True, True)
end;

 function NextButtonClick(CurPageID: Integer): Boolean;
 var Index:Integer;
 begin


 Result := True;
    if CurPageID = 9 then
    begin
        Index := WizardForm.TasksList.Items.IndexOf('清除之前遗留的数据缓存');
        if Index <> -1 then
           Log(IntToStr(Index ));
        if WizardForm.TasksList.Checked[Index] then
        begin
            if  MsgBox('您选择了删除保留数据,这可能导致您的个人配置信息丢失,且应用程序将使用默认设置,若要更改请点击取消!',mbInformation, MB_OKCANCEL) = IDOK then
              Result := True
           else
               Result := False;
        end;
    end;
 end;

procedure CurStepChanged(CurStep: TSetupStep);
var isdDelCache:Boolean;
      Index:Integer;
begin
  Index := WizardForm.TasksList.Items.IndexOf('清除之前遗留的数据缓存');
  isdDelCache :=  WizardForm.TasksList.Checked[Index];
  if CurStep = ssPostInstall then
  begin
     if isdDelCache then
     begin
        deleteCache();
     end;
  end;
end;

procedure CurPageChanged(CurPageID: Integer);
var Index:Integer;
begin
  if CurPageID = 9 then
  begin
        Index := WizardForm.TasksList.Items.IndexOf('清除之前遗留的数据缓存');
         WizardForm.TasksList.Checked[Index] := True;
  end;  
end;
[Languages]
Name: "chinesesimp"; MessagesFile: "compiler:Default.isl"
Name: "english"; MessagesFile: "compiler:Languages\English.isl"

[Tasks]
Name: "delCache"; Description: "清除之前遗留的数据缓存";GroupDescription:"遗留的数据缓存";Flags:checkablealone
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "createClosebat"; Description: "创建强制关闭脚本"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1; Check: not IsAdminInstallMode

[Files]
Source: "F:\PROJECT\liveGame_Windows\build\jsb-default\frameworks\runtime-src\proj.win32\Release.win32\liveGame_Windows.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "F:\PROJECT\liveGame_Windows\build\jsb-default\frameworks\runtime-src\proj.win32\Release.win32\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; 注意: 不要在任何共享系统文件上使用“Flags: ignoreversion”

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{autodesktop}\强制关闭直播PC端.bat"; Filename: "{app}\强制关闭直播PC端.bat"; Tasks: createClosebat
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: quicklaunchicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

