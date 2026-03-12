import { useNotificationStore } from "../store/useNotificationStore";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const { count, reset } = useNotificationStore();
  const navigate = useNavigate();

  const handleClick = () => {
    reset();
    navigate("/feed");
  };

  return (
    <div
      style={{
        position: "relative",
        cursor: "pointer",
        marginRight: "15px",
      }}
      onClick={handleClick}
    >
      <i className="bi bi-bell" style={{ fontSize: "20px" }}></i>

      {count > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-6px",
            right: "-8px",
            background: "red",
            color: "white",
            borderRadius: "50%",
            padding: "2px 6px",
            fontSize: "12px",
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}
