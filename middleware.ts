import { NextResponse } from "next/server";
import { auth } from "./auth";

const privateRoutes = [
  "/admin",
  "/dashboard",
  "/posts",
  "/legendas",
  "/calendario",
  "/agendamentos",
  "/whatsapp",
  "/financeiro"
];

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isPrivateRoute = privateRoutes.some((route) => pathname.startsWith(route));

  if (isPrivateRoute && !request.auth) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && !request.auth?.user?.isPlatformAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"]
};
