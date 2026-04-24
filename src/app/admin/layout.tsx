import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminNav } from "./admin-nav";
import { SignOutButton } from "./sign-out-button";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <Box sx={{ minHeight: "100vh", pb: 5 }}>
      <AppBar
        color="transparent"
        elevation={0}
        position="sticky"
        sx={{
          backdropFilter: "blur(18px)",
          backgroundColor: "rgba(255, 255, 255, 0.88)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              alignItems: { xs: "stretch", md: "center" },
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              py: 2,
            }}
          >
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                flexShrink: 0,
                gap: 2,
              }}
            >
              <Box
                sx={{
                  alignItems: "center",
                  background: "linear-gradient(135deg, #4f8cff, #2563eb)",
                  borderRadius: 3.5,
                  color: "common.white",
                  display: "inline-flex",
                  fontSize: 22,
                  fontWeight: 800,
                  height: 48,
                  justifyContent: "center",
                  width: 48,
                }}
              >
                ▣
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800 }} variant="h6">
                  棚からリクエスト
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  管理者向けダッシュボード
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                alignItems: { xs: "stretch", md: "center" },
                display: "flex",
                flex: 1,
                flexDirection: { xs: "column", lg: "row" },
                gap: 2,
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Box
                component="nav"
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.5,
                }}
              >
                <AdminNav />
              </Box>

              <Box
                sx={{
                  alignItems: { xs: "stretch", sm: "center" },
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.5,
                  justifyContent: "flex-end",
                }}
              >
                <Typography color="text.secondary" variant="body2">
                  {session.user.name}
                </Typography>
                <SignOutButton />
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container component="main" maxWidth="xl" sx={{ pt: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
