import React, { useEffect, useState } from "react";
import { FaUsersCog } from "react-icons/fa";
import axiosPublic from "../../api/axiosPublic";
import Swal from "sweetalert2";
import PageHeader from "../../components/ui/PageHeader";
import GlassPanel from "../../components/ui/GlassPanel";

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  const loadUsers = () => {
    axiosPublic
      .get("/all-users")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    const res = await axiosPublic.patch(`/users/role/${id}`, {
      role,
    });

    if (res.data.modifiedCount > 0) {
      Swal.fire({
        icon: "success",
        title: "Role Updated",
        timer: 1500,
        showConfirmButton: false,
      });

      loadUsers();
    }
  };

  return (
    <div>

      <PageHeader title="User Management" subtitle="Assign roles across every registered account." icon={<FaUsersCog />} />

      <GlassPanel className="overflow-x-auto">

        <table className="table table-zebra eco-table">

          <thead>

            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Change Role</th>
            </tr>

          </thead>

          <tbody>

            {users.map((user, index) => (
              <tr key={user._id}>

                <td>{index + 1}</td>

                <td>{user.name}</td>

                <td>{user.email}</td>

                <td>

                  <span className="badge badge-primary">
                    {user.role}
                  </span>

                </td>

                <td>{user.status}</td>

                <td>

                  <select
                    className="select select-bordered select-sm"
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(
                        user._id,
                        e.target.value
                      )
                    }
                  >
                    <option value="Household">Household</option>
                    <option value="Collector">Collector</option>
                    <option value="Business">Business</option>
                    <option value="Company">Company</option>
                    <option value="Admin">Admin</option>
                  </select>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </GlassPanel>

    </div>
  );
};

export default UserManagement;
