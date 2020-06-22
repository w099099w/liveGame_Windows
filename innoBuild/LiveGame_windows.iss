; �ű��� Inno Setup �ű��� ���ɣ�
; �йش��� Inno Setup �ű��ļ�����ϸ��������İ����ĵ���

#define MyAppName "LiveGame_windows"
#define MyInstanceName "LiveGame_windows"
#define MyAppVersion "1.1.1"
#define MyAppPublisher "cocos creater"
#define MyAppURL "http://www.cocos.com/"
#define MyAppExeName "liveGame_Windows.exe"

[Setup]
; ע: AppId��ֵΪ������ʶ��Ӧ�ó���
; ��ҪΪ������װ����ʹ����ͬ��AppIdֵ��
; (��Ҫ�����µ� GUID�����ڲ˵��е�� "����|���� GUID"��)
AppId={{E6F5B888-BF4E-457D-9271-BCF5A02DECD9}
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
; [Icons] �ġ�quicklaunchicon����Ŀʹ�� {userappdata}������ [Tasks] ��Ŀ�����ʺ� IsAdminInstallMode �ļ�顣
UsedUserAreasWarning=no
LicenseFile=F:\PROJECT\liveGame_Windows\xuke.txt
InfoBeforeFile=F:\PROJECT\liveGame_Windows\readme.txt
InfoAfterFile=F:\PROJECT\liveGame_Windows\installed.txt
; �Ƴ������У����ڹ���װģʽ�����У�Ϊ�����û���װ����
PrivilegesRequired=lowest
OutputDir=F:\PROJECT\liveGame_Windows\innoBuild
OutputBaseFilename=LiveGamePC_{#MyAppVersion}_setup
SetupIconFile=F:\PROJECT\liveGame_Windows\innoBuild\installed.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[code]
function deleteCache():Boolean;
var userName: String;
      deleteDir: String;
begin
      Result := True;
      userName := GetUserNameString();
      deleteDir :=  'C:\Users\'+userName;
      deleteDir := deleteDir++'\AppData\Local\{#MyInstanceName}';
      if DirExists(deleteDir) then
        DelTree(deleteDir, True, True, True)
end;
 function NextButtonClick(CurPageID: Integer): Boolean;
 var Index:Integer;
 begin
 Result := True;
    if CurPageID = 9 then
    begin
        Index := WizardForm.TasksList.Items.IndexOf('���֮ǰ���������ݻ���');
        if Index <> -1 then
           Log(IntToStr(Index ));
        if WizardForm.TasksList.Checked[Index] then
        begin
            if  MsgBox('��ѡ����ɾ����������,����ܵ������ĸ���������Ϣ��ʧ,��Ӧ�ó���ʹ��Ĭ������,��Ҫ��������ȡ��!',mbInformation, MB_OKCANCEL) = IDOK then
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
  Index := WizardForm.TasksList.Items.IndexOf('���֮ǰ���������ݻ���');
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
        Index := WizardForm.TasksList.Items.IndexOf('���֮ǰ���������ݻ���');
         WizardForm.TasksList.Checked[Index] := True;
  end;  
end;


[Languages]
Name: "chinesesimp"; MessagesFile: "compiler:Default.isl"
Name: "english"; MessagesFile: "compiler:Languages\English.isl"

[Tasks]
Name: "delCache"; Description: "���֮ǰ���������ݻ���";GroupDescription:"���������ݻ���";Flags:checkablealone
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1; Check: not IsAdminInstallMode

[Files]
Source: "F:\PROJECT\liveGame_Windows\build\jsb-default\frameworks\runtime-src\proj.win32\Release.win32\liveGame_Windows.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "F:\PROJECT\liveGame_Windows\build\jsb-default\frameworks\runtime-src\proj.win32\Release.win32\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; ע��: ��Ҫ���κι���ϵͳ�ļ���ʹ�á�Flags: ignoreversion��

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: quicklaunchicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

