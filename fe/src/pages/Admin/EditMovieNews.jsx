import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import SidebarLayout from '../../components/Sidebar-Admin';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { TextArea } = Input;

const EditMovieNews = () => {
  const [form] = Form.useForm();
  const token = localStorage.getItem('token');
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [editStates, setEditStates] = useState({
    title: false,
    short_description: false,
    content: false,
    author: false,
    date: false,
    image: false,
  });

  const toggleEdit = (field) => {
    setEditStates((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    if (!form) return;

    const fetchNews = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/movie-news/${id}`);
        const data = await res.json();

        if (res.ok) {
          form.setFieldsValue({
            title: data.title,
            short_description: data.short_description,
            content: data.content,
            author: data.author,
            date: dayjs(data.date),
          });

          if (data.image_url) {
            setFileList([
              {
                uid: '-1',
                name: 'image.jpg',
                status: 'done',
                url: data.image_url,
              },
            ]);
          }
        } else {
          message.error('Không tìm thấy bài viết');
        }
      } catch (error) {
        message.error('Lỗi khi tải dữ liệu movie news');
      }
    };

    fetchNews();
  }, [id, form]);

  const onUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('short_description', values.short_description);
    formData.append('content', values.content);
    formData.append('author', values.author);
    formData.append('date', values.date.format('YYYY-MM-DD'));
    if (fileList[0]?.originFileObj) {
      formData.append('image', fileList[0].originFileObj);
    }
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/movie-news/${id}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        message.success('News updated successfully');
        navigate('/admin/movienews-list');
      } else {
        message.error(result.error || 'Update failed');
      }
    } catch (err) {
      message.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-white text-black font-semibold border border-slate-600 rounded';

  return (
    <SidebarLayout>
      <div className="py-10 px-6 max-w-3xl mx-auto bg-slate-800 rounded-lg text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">Edit Movie News</h2>
        <Form layout="vertical" onFinish={onFinish} form={form}>
          {['title', 'short_description', 'content', 'author'].map((field) => (
            <Form.Item
              key={field}
              name={field}
              label={<span className="text-white font-semibold">{field.replace(/_/g, ' ').toUpperCase()}</span>}
            >
              {editStates[field] ? (
                field === 'short_description' || field === 'content' ? (
                  <TextArea rows={3} className={inputClass} />
                ) : (
                  <Input className={inputClass} />
                )
              ) : (
                <div className="flex justify-between items-center bg-white text-black px-3 py-2 rounded">
                  <span className="font-bold">{form.getFieldValue(field)}</span>
                  <Button onClick={() => toggleEdit(field)} type="link">Edit</Button>
                </div>
              )}
            </Form.Item>
          ))}

          {/* Date */}
          <Form.Item
            name="date"
            label={<span className="text-white font-semibold">Date</span>}
          >
            {editStates.date ? (
              <DatePicker className={inputClass} />
            ) : (
              <div className="flex justify-between items-center bg-white text-black px-3 py-2 rounded">
                <span className="font-bold">
                  {form.getFieldValue('date')?.format?.('YYYY-MM-DD')}
                </span>
                <Button onClick={() => toggleEdit('date')} type="link">Edit</Button>
              </div>
            )}
          </Form.Item>

          {/* Image Upload */}
          <Form.Item
            name="image"
            label={<span className="text-white font-semibold">Image</span>}
          >
            {!editStates.image ? (
              <div className="flex justify-between items-center">
                <img
                  src={fileList[0]?.url}
                  alt="preview"
                  className="h-24 rounded shadow"
                />
                <Button onClick={() => toggleEdit('image')} type="link">Edit</Button>
              </div>
            ) : (
              <Upload
                beforeUpload={() => false}
                fileList={fileList}
                onChange={onUploadChange}
                maxCount={1}
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
            )}
          </Form.Item>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => navigate('/admin/movienews-list')}
              className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded shadow hover:shadow-lg transition duration-300"
            >
              {loading ? 'Saving...' : 'Update News'}
            </button>
          </div>
        </Form>
      </div>
    </SidebarLayout>
  );
};

export default EditMovieNews;
