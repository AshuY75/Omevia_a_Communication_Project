import { GoogleLogin } from "@react-oauth/google";

function Auth({ onSuccess }) {
  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        console.log("Google credential:", credentialResponse);
        onSuccess(credentialResponse.credential); // ✅ CORRECT
      }}
      onError={() => {
        console.log("Login Failed");
      }}
    />
  );
}

export default Auth;
