#define _GNU_SOURCE

#include <errno.h>
#include <fcntl.h>
#include <signal.h>
#include <stdarg.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/ioctl.h>
#include <sys/mount.h>
#include <sys/reboot.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

#define B8G_ABI_MAGIC_V3 0x33564742U

static void ensure_dir(const char *path, mode_t mode) {
    if (mkdir(path, mode) != 0 && errno != EEXIST) {
        fprintf(stderr, "[T2SDE-BASELINE] warn: mkdir(%s): %s\n", path, strerror(errno));
    }
}

static void mount_or_warn(const char *src, const char *target, const char *fstype,
                          unsigned long flags, const void *data) {
    if (mount(src, target, fstype, flags, data) != 0 && errno != EBUSY) {
        fprintf(stderr, "[T2SDE-BASELINE] warn: mount(%s -> %s): %s\n", src, target, strerror(errno));
    }
}

static int cmdline_has(const char *token) {
    int fd = open("/proc/cmdline", O_RDONLY);
    if (fd < 0) return 0;
    char buf[4096];
    ssize_t n = read(fd, buf, sizeof(buf) - 1);
    close(fd);
    if (n <= 0) return 0;
    buf[n] = '\0';
    return strstr(buf, token) != NULL;
}

static void reap(int sig) {
    (void)sig;
    while (waitpid(-1, NULL, WNOHANG) > 0) {}
}

int main(void) {
    setvbuf(stdout, NULL, _IONBF, 0);
    setvbuf(stderr, NULL, _IONBF, 0);

    setenv("PATH", "/bin:/sbin:/usr/bin:/usr/sbin:/opt/t2sde/scripts", 1);
    setenv("HOME", "/root", 1);
    setenv("TERM", "linux", 1);
    setenv("B8G_CAS_DIR", "/var/lib/b8g/cas", 1);

    ensure_dir("/proc", 0555);
    ensure_dir("/sys", 0555);
    ensure_dir("/dev", 0755);
    ensure_dir("/tmp", 01777);
    ensure_dir("/run", 0755);
    ensure_dir("/var", 0755);
    ensure_dir("/var/lib", 0755);
    ensure_dir("/var/lib/b8g", 0755);
    ensure_dir("/var/lib/b8g/cas", 0755);

    mount_or_warn("proc", "/proc", "proc", MS_NOSUID | MS_NOEXEC | MS_NODEV, NULL);
    mount_or_warn("sysfs", "/sys", "sysfs", MS_NOSUID | MS_NOEXEC | MS_NODEV, NULL);
    mount_or_warn("devtmpfs", "/dev", "devtmpfs", MS_NOSUID, "mode=0755");
    mount_or_warn("tmpfs", "/tmp", "tmpfs", MS_NOSUID | MS_NODEV, "mode=1777");
    mount_or_warn("tmpfs", "/run", "tmpfs", MS_NOSUID | MS_NODEV, "mode=0755");
    mount_or_warn("tmpfs", "/var/lib/b8g/cas", "tmpfs", 0, "mode=0755,size=512M");

    ensure_dir("/var/lib/b8g/cas/v11", 0755);
    ensure_dir("/var/lib/b8g/cas/v11/files", 0755);

    printf("[T2SDE-BASELINE] PID 1 READY (B8G_ABI_MAGIC_V3=0x%08X)\n", (unsigned)B8G_ABI_MAGIC_V3);
    if (access("/opt/t2sde/scripts/Build-Pkg", X_OK) == 0) {
        printf("[T2SDE-BASELINE] Original T2 SDE tooling present at /opt/t2sde/scripts/\n");
    }

    if (cmdline_has("t2baseline.selftest=1")) {
        printf("[T2SDE-BASELINE] SELFTEST PASS\n");
        fflush(stdout);
        sync();
        (void)reboot(RB_POWER_OFF);
        for (;;) pause();
    }

    printf("\n============================================================\n");
    printf("  Awesome-OS T2Linux Baseline (Original T2 SDE + v11 CAS)\n");
    printf("  Tooling : /opt/t2sde/scripts/{Config,Build-Pkg,Emerge-Pkg}\n");
    printf("  Builder : /bin/t2-cas-initramfs.sh\n");
    printf("  v11 CAS : /var/lib/b8g/cas/v11/files/\n");
    printf("============================================================\n\n");

    struct sigaction sa;
    memset(&sa, 0, sizeof(sa));
    sa.sa_handler = reap;
    sa.sa_flags = SA_RESTART | SA_NOCLDSTOP;
    (void)sigaction(SIGCHLD, &sa, NULL);

    for (;;) {
        pid_t pid = fork();
        if (pid == 0) {
            (void)setsid();
            char *const sh_argv[] = {"/bin/sh", "-l", NULL};
            execv("/bin/sh", sh_argv);
            _exit(127);
        }
        if (pid > 0) {
            int st = 0;
            while (waitpid(pid, &st, 0) < 0 && errno == EINTR) {}
        }
        sleep(1);
    }
    return 0;
}
