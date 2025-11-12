import { useState, useEffect } from 'react';
import api from './api'; // Assuming you have an axios instance configured here, like in your original file
import './App.css';

const App = () => {
  // State for data from the backend
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);

  // State for the 'Create User' form
  const [userFormData, setUserFormData] = useState({
    username: '',
  });

  // State for the 'Create Post' form
  const [postFormData, setPostFormData] = useState({
    title: '',
    content: '',
    user_id: '', // User ID is needed for post creation
  });

  // --- Fetch Data Functions ---
  
  const fetchUsers = async () => {
    try {
      // Assuming you have an endpoint to list all users (e.g., /users/)
      // NOTE: Your FastAPI code did not include a /users/ GET endpoint for all users,
      // so this is an assumption based on typical app structure.
      const response = await api.get('/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback/Placeholder: If no /users/ list endpoint exists, we can create dummy data for the post form dropdown
    }
  };

  const fetchPosts = async () => {
    try {
      // Assuming you have an endpoint to list all posts (e.g., /posts/)
      // NOTE: Your FastAPI code did not include a /posts/ GET endpoint for all posts.
      const response = await api.get('/posts/');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts. Showing placeholder data.', error);
      // Placeholder data if the /posts/ list endpoint doesn't exist
      
    }
  };

  // Fetch initial data on component mount
  useEffect(() => {
    fetchUsers();
    fetchPosts();
  }, []);

  // --- Form Handlers ---

  const handleUserInputChange = (e) => {
    setUserFormData({
      ...userFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePostInputChange = (e) => {
    setPostFormData({
      ...postFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/', userFormData);
      await fetchUsers(); // Refresh the user list/dropdown
      setUserFormData({ username: '' }); // Clear form
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure user_id is an integer before sending
      const postDataToSend = {
        ...postFormData,
        user_id: parseInt(postFormData.user_id),
      };

      // Basic validation for missing fields
      if (!postDataToSend.title || !postDataToSend.content || !postDataToSend.user_id) {
        alert("Please fill out all post fields.");
        return;
      }
      
      await api.post('/posts/', postDataToSend);
      await fetchPosts(); // Refresh the post list
      setPostFormData({ title: '', content: '', user_id: '' }); // Clear form
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // --- Delete Handler ---

  const handleDeletePost = async (id) => {
    try {
      await api.delete(`/posts/${id}`);
      // Optimistic update: remove from state without full re-fetch
      setPosts(posts.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div>
      <nav className='navbar navbar-dark bg-dark'>
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Blogger App</a>
        </div>
      </nav>

      <div className="container mt-4">
        
        {/* --- Create User Section --- */}
        <div className="row">
          <div className="col-md-6">
            <h2>👤 Create User</h2>
            <form onSubmit={handleUserSubmit}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className='form-control'
                  name='username'
                  onChange={handleUserInputChange}
                  value={userFormData.username}
                  required
                />
              </div>
              <button type="submit" className="btn btn-success">
                Create User
              </button>
            </form>
          </div>
          
          {/* --- Create Post Section --- */}
          <div className="col-md-6">
            <h2>📝 Create Post</h2>
            <form onSubmit={handlePostSubmit}>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className='form-control'
                  name='title'
                  onChange={handlePostInputChange}
                  value={postFormData.title}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Content</label>
                <textarea
                  className='form-control'
                  name='content'
                  onChange={handlePostInputChange}
                  value={postFormData.content}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Author (User ID)</label>
                <select
                  className='form-select'
                  name='user_id'
                  onChange={handlePostInputChange}
                  value={postFormData.user_id}
                  required
                >
                  <option value="" disabled>Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} (ID: {user.id})
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary">
                Create Post
              </button>
            </form>
          </div>
        </div>

        <hr className='my-5'/>

        {/* --- Users List Table --- */}
        <h2 className='mb-3'>👥 Users List</h2>
        <table className="table table-sm table-striped table-hover mt-4">
          <thead className="table-success">
            <tr>
              <th>ID</th>
              <th>Username</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="2">No users found. Create one above!</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <hr className='my-5'/>

        {/* --- Posts List Table --- */}
        <h2 className='mb-3'>📰 Posts List</h2>
        <table className="table table-striped table-bordered table-hover mt-4">
          <thead className="table-primary">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Content</th>
              <th>User ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan="5">No posts found. Create one above!</td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id}>
                  <td>{post.id}</td>
                  <td>{post.title}</td>
                  <td>{post.content}</td>
                  <td>{post.user_id}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;