using System.Reflection;
using System.Text;
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
    private readonly WebView2 _web = new() { Dock = DockStyle.Fill };
    private readonly string _dataRoot;
    private string _webRoot = "";

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
            Program.Log("assets extracted to " + _webRoot);

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
        // 外部链接（如 GitHub）交给系统浏览器打开
        e.Handled = true;
        try
        {
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(e.Uri) { UseShellExecute = true });
        }
        catch { }
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
}
