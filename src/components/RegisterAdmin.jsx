import React, { useState } from "react";
import { useRegisterMutation } from "../redux/api";
import toast from "react-hot-toast";

const RegisterAdmin = () => {

    const [registerUser, { isLoading }] = useRegisterMutation();

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        role: "admin"
    });

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await registerUser(form).unwrap();

            toast.success("User created successfully");

            setForm({
                name: "",
                phone: "",
                email: "",
                password: "",
                role: "admin"
            });

        } catch (error) {

            toast.error(error?.data?.message || "Registration failed");

        }

    };

    return (

        <div className="registerContainer">

            <h2>Create User</h2>

            <form onSubmit={handleSubmit} className="registerForm">

                <input
                    type="text"
                    name="name"
                    placeholder="Enter Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="phone"
                    placeholder="Enter Phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Enter Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Enter Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="executive">Executive</option>
                </select>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create User"}
                </button>

            </form>

        </div>

    );

};

export default RegisterAdmin;