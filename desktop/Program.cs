using System.Diagnostics;
using System.IO.Compression;
using System.Reflection;
using System.Text;
using System.Text.Json;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace TikuDesktop;

internal static class Program
{
    internal static void Log(string message)
    {
        var line = DateTime.Now.ToString("HH:mm:ss.fff") + " " + message + Environment.NewLine;
        foreach (var path in new[]
        {
            Path.Combine(Path.GetTempPath(), "TikuDesktop-startup.log"),
            Path.Combine(AppContext.BaseDirectory, "TikuDesktop-startup.log"),
        })
        {
            try { File.AppendAllText(path, line); return; } catch { }
        }
    }

    [STAThread]
    private static void Main()
    {
        Log("Main start, base=" + AppContext.BaseDirectory);
        ApplicationConfiguration.Initialize();
        Application.Run(new MainForm());
    }
}

public sealed class MainForm : Form
{
    private const string AppId = "ComputerProgrammer4Tiku";
    private const string TccVersion = "0.9.27";
    private readonly WebView2 _web = new() { Dock = DockStyle.Fill };
    private readonly string _dataRoot;
    private string _webRoot = "";
    private bool _fullscreen;
    private Rectangle _prevBounds;
    private FormWindowState _prevState;
    private FormBorderStyle _prevBorder;

    public MainForm()
    {
        _dataRoot = ResolveDataRootOrFallback();
        Program.Log("data root: " + _dataRoot);
        Text = "计算机程序设计员（四级）题库";
        StartPosition = FormStartPosition.CenterScreen;
        ClientSize = new Size(1400, 900);
        MinimumSize = new Size(1040, 680);
        BackColor = Color.White;
        try
        {
            var asm = Assembly.GetExecutingAssembly();
            using var stream = asm.GetManifestResourceStream("app.ico");
            if (stream != null) Icon = new Icon(stream);
        }
        catch { /* 图标缺失不影响使用 */ }

        Controls.Add(_web);
        Load += async (_, _) => await InitAsync();
    }

    private async Task InitAsync()
    {
        try
        {
            Program.Log("InitAsync start");
            _webRoot = Path.Combine(_dataRoot, "web");
            ExtractWebAssets(_webRoot);
            ExtractTcc();
            Program.Log("assets and tcc ready");

            var userData = Path.Combine(_dataRoot, "WebView2");
            Directory.CreateDirectory(userData);

            var env = await CoreWebView2Environment.CreateAsync(null, userData);
            Program.Log("WebView2 env created");
            await _web.EnsureCoreWebView2Async(env);
            Program.Log("WebView2 initialized");

            var core = _web.CoreWebView2;
            core.SetVirtualHostNameToFolderMapping("app.local", _webRoot, CoreWebView2HostResourceAccessKind.Allow);
            core.Settings.AreDevToolsEnabled = false;
            core.Settings.AreBrowserAcceleratorKeysEnabled = false;
            core.Settings.IsStatusBarEnabled = false;
            core.Settings.AreDefaultContextMenusEnabled = true;
            core.Settings.IsZoomControlEnabled = false;
            core.NewWindowRequested += OnNewWindowRequested;
            core.WebMessageReceived += OnWebMessageReceived;
            core.Navigate("https://app.local/index.html");
            Program.Log("navigate issued");
        }
        catch (WebView2RuntimeNotFoundException ex)
        {
            Program.Log("WebView2 runtime missing: " + ex);
            MessageBox.Show(
                "未检测到 Microsoft Edge WebView2 运行时。\n\n请先安装 WebView2 运行时后重新打开本程序：\nhttps://go.microsoft.com/fwlink/p/?LinkId=2124703",
                "无法启动题库", MessageBoxButtons.OK, MessageBoxIcon.Error);
            Close();
        }
        catch (Exception ex)
        {
            Program.Log("init failed: " + ex);
            MessageBox.Show("程序启动失败：\n" + ex.Message, "无法启动题库", MessageBoxButtons.OK, MessageBoxIcon.Error);
            Close();
        }
    }

    private static string ResolveDataRootOrFallback()
    {
        try { return ResolveDataRoot(); }
        catch { return Path.Combine(AppContext.BaseDirectory, "TikuData"); }
    }

    private static string ResolveDataRoot()
    {
        var candidates = new List<string>();
        var custom = Environment.GetEnvironmentVariable("TIKU_DATA_DIR");
        if (!string.IsNullOrWhiteSpace(custom)) candidates.Add(custom);
        candidates.Add(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), AppId));
        candidates.Add(Path.Combine(AppContext.BaseDirectory, "TikuData"));
        candidates.Add(Path.Combine(Path.GetTempPath(), AppId));

        foreach (var dir in candidates)
        {
            try
            {
                Directory.CreateDirectory(dir);
                var probe = Path.Combine(dir, ".write-test");
                File.WriteAllText(probe, "ok");
                File.Delete(probe);
                return dir;
            }
            catch { }
        }
        throw new IOException("没有可写的数据目录，无法保存答题记录。");
    }

    private void OnNewWindowRequested(object? sender, CoreWebView2NewWindowRequestedEventArgs e)
    {
        e.Handled = true;
        try
        {
            Process.Start(new ProcessStartInfo(e.Uri) { UseShellExecute = true });
        }
        catch { }
    }

    protected override bool ProcessCmdKey(ref Message msg, Keys keyData)
    {
        if (keyData == Keys.F11)
        {
            ToggleFullscreen();
            return true;
        }
        if (keyData == Keys.Escape && _fullscreen)
        {
            ToggleFullscreen();
            return true;
        }
        return base.ProcessCmdKey(ref msg, keyData);
    }

    private void ToggleFullscreen()
    {
        if (!_fullscreen)
        {
            _prevBounds = Bounds;
            _prevState = WindowState;
            _prevBorder = FormBorderStyle;
            FormBorderStyle = System.Windows.Forms.FormBorderStyle.None;
            WindowState = FormWindowState.Normal;
            TopMost = true;
            Bounds = Screen.FromControl(this).Bounds;
            _fullscreen = true;
        }
        else
        {
            TopMost = false;
            FormBorderStyle = _prevBorder;
            Bounds = _prevBounds;
            WindowState = _prevState;
            _fullscreen = false;
        }
    }

    private async void OnWebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        try
        {
            using var doc = JsonDocument.Parse(e.WebMessageAsJson);
            var root = doc.RootElement;
            if (!root.TryGetProperty("type", out var typeEl)) return;
            var type = typeEl.GetString();

            if (type == "toggle-fullscreen")
            {
                ToggleFullscreen();
                return;
            }

            if (type == "exit-fullscreen")
            {
                if (_fullscreen) ToggleFullscreen();
                return;
            }

            if (type == "run-c")
            {
                var id = root.TryGetProperty("id", out var idEl) ? idEl.GetString() : "";
                var code = root.TryGetProperty("code", out var codeEl) ? codeEl.GetString() ?? "" : "";
                var stdin = root.TryGetProperty("stdin", out var inEl) ? inEl.GetString() ?? "" : "";
                var result = await RunCAsync(code, stdin);
                var payload = JsonSerializer.Serialize(new
                {
                    type = "run-c-result",
                    id,
                    ok = result.ok,
                    output = result.output,
                    error = result.error,
                    timedOut = result.timedOut
                });
                _web.CoreWebView2?.PostWebMessageAsJson(payload);
            }
        }
        catch (Exception ex)
        {
            Program.Log("web message failed: " + ex);
        }
    }

    private async Task<(bool ok, string output, string error, bool timedOut)> RunCAsync(string code, string stdin)
    {
        if (code.Length > 100_000) return (false, "", "代码过长（上限 100 KB）。", false);
        var tccExe = Path.Combine(_dataRoot, "tcc", "tcc.exe");
        if (!File.Exists(tccExe)) return (false, "", "内置 C 编译器未找到，请重新安装桌面版。", false);

        var dir = Path.Combine(_dataRoot, "runs", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(dir);
        try
        {
            var src = Path.Combine(dir, "main.c");
            var exe = Path.Combine(dir, "main.exe");
            await File.WriteAllTextAsync(src, code, new UTF8Encoding(false));

            var compile = await RunProcessAsync(tccExe, new[] { "-w", "-o", exe, src }, dir, "", 15000);
            if (compile.timedOut) return (false, "", "编译超时。", true);
            if (compile.exitCode != 0 || !File.Exists(exe))
            {
                var message = (compile.stderr + "\n" + compile.stdout).Trim();
                return (false, "", Truncate(string.IsNullOrWhiteSpace(message) ? "编译失败。" : message, 8000), false);
            }

            var run = await RunProcessAsync(exe, Array.Empty<string>(), dir, stdin, 5000);
            var output = run.stdout;
            if (!string.IsNullOrWhiteSpace(run.stderr)) output += (output.Length > 0 ? "\n" : "") + run.stderr;
            if (run.timedOut) output += (output.Length > 0 ? "\n" : "") + "[运行超过 5 秒，已终止]";
            return (true, Truncate(output, 20000), "", run.timedOut);
        }
        catch (Exception ex)
        {
            return (false, "", "运行失败：" + ex.Message, false);
        }
        finally
        {
            try { Directory.Delete(dir, true); } catch { }
        }
    }

    private static async Task<(int exitCode, string stdout, string stderr, bool timedOut)> RunProcessAsync(
        string file, string[] args, string workingDir, string stdin, int timeoutMs)
    {
        var psi = new ProcessStartInfo(file)
        {
            WorkingDirectory = workingDir,
            UseShellExecute = false,
            CreateNoWindow = true,
            RedirectStandardInput = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            StandardOutputEncoding = Encoding.UTF8,
            StandardErrorEncoding = Encoding.UTF8,
        };
        foreach (var arg in args) psi.ArgumentList.Add(arg);

        using var process = new Process { StartInfo = psi };
        process.Start();

        try
        {
            if (!string.IsNullOrEmpty(stdin))
            {
                await process.StandardInput.WriteAsync(stdin);
            }
            process.StandardInput.Close();
        }
        catch { }

        var outTask = process.StandardOutput.ReadToEndAsync();
        var errTask = process.StandardError.ReadToEndAsync();
        var waitTask = process.WaitForExitAsync();
        var finished = await Task.WhenAny(waitTask, Task.Delay(timeoutMs));
        var timedOut = finished != waitTask;

        if (timedOut)
        {
            try { process.Kill(entireProcessTree: true); } catch { }
        }
        else
        {
            await waitTask;
        }

        var stdout = "";
        var stderr = "";
        try { stdout = await outTask; } catch { }
        try { stderr = await errTask; } catch { }
        return (timedOut ? -1 : process.ExitCode, stdout, stderr, timedOut);
    }

    private static string Truncate(string text, int max)
    {
        if (string.IsNullOrEmpty(text) || text.Length <= max) return text ?? "";
        return text.Substring(0, max) + "\n…（输出过长，已截断）";
    }

    private static void ExtractWebAssets(string webRoot)
    {
        Directory.CreateDirectory(webRoot);
        var asm = Assembly.GetExecutingAssembly();
        var files = new (string Resource, string Relative)[]
        {
            ("web/index.html", "index.html"),
            ("web/assets/bank.js", Path.Combine("assets", "bank.js")),
            ("web/assets/favicon.png", Path.Combine("assets", "favicon.png")),
            ("web/sim-install.js", "sim-install.js"),
            ("web/sim-assets/sublime-dest.png", Path.Combine("sim-assets", "sublime-dest.png")),
            ("web/sim-assets/vscode-license.png", Path.Combine("sim-assets", "vscode-license.png")),
            ("web/sim-assets/vscode-tasks.png", Path.Combine("sim-assets", "vscode-tasks.png")),
            ("web/sim-assets/vscode-ready.png", Path.Combine("sim-assets", "vscode-ready.png")),
        };

        foreach (var (resource, relative) in files)
        {
            using var stream = asm.GetManifestResourceStream(resource)
                ?? throw new InvalidOperationException("缺少内置资源：" + resource);
            var target = Path.Combine(webRoot, relative);
            Directory.CreateDirectory(Path.GetDirectoryName(target)!);
            using var file = File.Create(target);
            stream.CopyTo(file);
        }
    }

    private void ExtractTcc()
    {
        var tccRoot = Path.Combine(_dataRoot, "tcc");
        var stamp = Path.Combine(tccRoot, ".version");
        if (File.Exists(Path.Combine(tccRoot, "tcc.exe")) && File.Exists(stamp)
            && File.ReadAllText(stamp).Trim() == TccVersion)
        {
            return;
        }

        try
        {
            if (Directory.Exists(tccRoot)) Directory.Delete(tccRoot, true);
            Directory.CreateDirectory(_dataRoot);
            var asm = Assembly.GetExecutingAssembly();
            using var stream = asm.GetManifestResourceStream("tcc.zip")
                ?? throw new InvalidOperationException("缺少内置 C 编译器");
            using var zip = new ZipArchive(stream, ZipArchiveMode.Read);
            zip.ExtractToDirectory(_dataRoot, true);
            File.WriteAllText(stamp, TccVersion);
            Program.Log("tcc extracted");
        }
        catch (Exception ex)
        {
            Program.Log("tcc extract failed: " + ex);
        }
    }
}
