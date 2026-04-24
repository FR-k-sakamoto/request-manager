import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "./login-form";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

function getLoginErrorMessage(error: string) {
  switch (error) {
    case "forbidden":
      return "管理操作には管理者権限が必要です。";
    case "CredentialsSignin":
      return "メールアドレスまたはパスワードが正しくありません。";
    default:
      return "";
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const rawError = Array.isArray(params.error) ? params.error[0] : params.error ?? "";
  const error = getLoginErrorMessage(rawError);

  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/");
  }

  return (
    <Grid
      container
      sx={{
        minHeight: "100vh",
        p: { xs: 3, md: 5 },
        gap: 4,
        alignItems: "stretch",
      }}
    >
      {/* Hero panel */}
      <Grid
        size={{ xs: 12, md: "grow" }}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 2.25,
          p: { xs: 3.5, md: 6 },
          border: "1px solid rgba(214, 222, 237, 0.9)",
          borderRadius: "28px",
          boxShadow: 1,
          backdropFilter: "blur(18px)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(244,249,255,0.94)), radial-gradient(circle at top right, rgba(37,99,235,0.16), transparent 30%)",
        }}
      >
        <Box
          sx={{
            width: 68,
            height: 68,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #4f8cff, #2563eb)",
            color: "#fff",
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          棚
        </Box>
        <Typography
          sx={{
            color: "primary.main",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Inventory Request Manager
        </Typography>
        <Typography
          variant="h1"
          sx={{
            fontSize: "clamp(40px, 6vw, 64px)",
            lineHeight: 1.05,
            fontWeight: 700,
          }}
        >
          棚からリクエスト
        </Typography>
        <Typography sx={{ maxWidth: "40rem", color: "muted", fontSize: 18, lineHeight: 1.8 }}>
          一般ユーザーは依頼の参照と投稿、管理者は依頼の承認・却下などの管理操作を行えます。
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mt: 2.25,
            p: 2.5,
            borderRadius: "20px",
            bgcolor: "rgba(37, 99, 235, 0.06)",
            border: "1px solid rgba(37, 99, 235, 0.12)",
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>開発用の初期ユーザー</Typography>
          <Typography component="code" sx={{ color: "primary.dark" }}>
            admin@example.com / Admin123!
          </Typography>
          <Typography component="code" sx={{ color: "primary.dark" }}>
            user@example.com / User123!
          </Typography>
        </Box>
      </Grid>

      {/* Login panel */}
      <Grid
        size={{ xs: 12, md: "auto" }}
        sx={{
          width: { md: 520 },
          minWidth: { md: 360 },
          alignSelf: "center",
        }}
      >
        <Card
          sx={{
            borderRadius: "28px",
            border: "1px solid rgba(214, 222, 237, 0.9)",
            boxShadow: 1,
            backdropFilter: "blur(18px)",
            bgcolor: "rgba(255,255,255,0.94)",
          }}
        >
          <CardContent sx={{ p: { xs: 3.5, md: 5 } }}>
            <Box sx={{ display: "grid", gap: 1.25, mb: 3.5 }}>
              <Typography variant="h2" sx={{ fontSize: 30, fontWeight: 700 }}>
                ログイン
              </Typography>
              <Typography sx={{ color: "muted", lineHeight: 1.7 }}>
                ログイン後は権限に応じて利用できる画面へ自動で遷移します。
              </Typography>
            </Box>

            <LoginForm defaultError={error} />

            <Box sx={{ display: "grid", gap: 1, mt: 3 }}>
              <Typography sx={{ color: "muted", lineHeight: 1.7 }}>
                Auth.js の Credentials 認証を使用しています。
              </Typography>
              <Typography sx={{ color: "muted", lineHeight: 1.7 }}>
                管理操作は `User.role` が `ADMIN` のユーザーのみに制限されます。
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
