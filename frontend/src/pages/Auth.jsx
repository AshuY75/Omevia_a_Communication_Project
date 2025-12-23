import { GoogleLogin } from "@react-oauth/google";

function Auth({ onSuccess }) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (!credentialResponse?.credential) {
            console.error("❌ No Google credential received");
            return;
          }

          console.log("✅ Google credential received");
          onSuccess(credentialResponse.credential);
        }}
        onError={() => {
          console.error("❌ Google login failed");
        }}
        useOneTap={false}
      />
    </div>
  );
}

export default Auth;
